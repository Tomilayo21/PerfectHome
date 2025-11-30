import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/config/db";
import VisitorLog from "@/models/VisitorLog";
import Property from "@/models/Property";
import { subDays, subMonths, format } from "date-fns";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const range = parseInt(searchParams.get("range") || "30", 10);

    const now = new Date();
    const sinceDate = subDays(now, range - 1); // last 'range' days including today
    const untilDate = now;

    const extractPropertyId = (path) => {
      if (!path) return null;
      const match = path.match(/\/property\/([^\/]+)/);
      return match ? match[1] : null;
    };

    /* ------------------------ TOP PAGES ------------------------ */
    const topPagesRaw = await VisitorLog.aggregate([
      {
        $match: {
          event: "page_view",
          createdAt: { $gte: sinceDate, $lte: untilDate },
        },
      },
      {
        $group: {
          _id: "$path",
          views: { $sum: 1 },
        },
      },
      { $sort: { views: -1 } },
      { $limit: 5 },
    ]);

    // Optional: convert _id "/" to "Home" or format nicely in frontend
    const topPages = topPagesRaw.map((p) => ({
      _id: p._id,
      views: p.views,
    }));


    /* ------------------------ GLOBAL STATS ------------------------ */
    const totalPageViews = await VisitorLog.countDocuments({
      event: "page_view",
      createdAt: { $gte: sinceDate, $lte: untilDate },
    });

    const totalVisitors = await VisitorLog.distinct("ip", {
      createdAt: { $gte: sinceDate, $lte: untilDate },
    });

    const totalClicks = await VisitorLog.countDocuments({
      event: "button_click",
      createdAt: { $gte: sinceDate, $lte: untilDate },
    });

    /* ------------------------ PROPERTY VIEWS ------------------------ */
    const propertyViews = await VisitorLog.find({
      event: "page_view",
      path: /\/property\//,
      createdAt: { $gte: sinceDate, $lte: untilDate },
    }).lean();

    const propertyViewMap = {};
    for (const v of propertyViews) {
      const id = extractPropertyId(v.path);
      if (!id || !mongoose.Types.ObjectId.isValid(id)) continue;
      propertyViewMap[id] = (propertyViewMap[id] || 0) + 1;
    }

    const topViewedProperties = (
      await Promise.all(
        Object.entries(propertyViewMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10) // fetch more to filter later
          .map(async ([propertyId, views]) => {
            if (!mongoose.Types.ObjectId.isValid(propertyId)) return null;
            const property = await Property.findById(propertyId).lean();
            if (!property) return null; // skip deleted/missing properties
            return { propertyId, views, property };
          })
      )
    ).filter(Boolean) 
      .slice(0, 5); 


    /* ------------------------ TOP LOCATIONS ------------------------ */
    const locationCount = {};
    for (const [propertyId, views] of Object.entries(propertyViewMap)) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) continue;
      const p = await Property.findById(propertyId).lean();
      if (!p) continue;
      const loc = `${p.city || "Unknown"}, ${p.state || "Unknown"}`;
      locationCount[loc] = (locationCount[loc] || 0) + views;
    }

    const topLocations = Object.entries(locationCount)
      .map(([location, views]) => ({ location, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    /* ------------------------ ENGAGED PROPERTIES ------------------------ */
    const propertyClicks = await VisitorLog.find({
      event: "button_click",
      path: /\/property\//,
      createdAt: { $gte: sinceDate, $lte: untilDate },
    }).lean();

    const clickMap = {};
    for (const v of propertyClicks) {
      const id = extractPropertyId(v.path);
      if (!id || !mongoose.Types.ObjectId.isValid(id)) continue;
      clickMap[id] = (clickMap[id] || 0) + 1;
    }

    const topEngagedProperties = (
      await Promise.all(
        Object.entries(clickMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(async ([propertyId, clicks]) => {
            if (!mongoose.Types.ObjectId.isValid(propertyId)) return null;
            const property = await Property.findById(propertyId).lean();
            if (!property) return null;
            return { propertyId, clicks, property };
          })
      )
    ).filter(Boolean)
      .slice(0, 5);


    /* ------------------------ DAILY METRICS ------------------------ */
    const aggregateDaily = async (eventType) => {
      const raw = await VisitorLog.aggregate([
        { $match: { ...(eventType ? { event: eventType } : {}), createdAt: { $gte: sinceDate, $lte: untilDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);

      const dailyMap = raw.reduce((acc, cur) => {
        acc[cur._id] = cur.count;
        return acc;
      }, {});

      const daily = [];
      for (let i = 0; i < range; i++) {
        const d = subDays(now, range - 1 - i);
        const iso = format(d, "yyyy-MM-dd");
        daily.push({
          date: iso,
          label: format(d, "MMM d"),
          count: dailyMap[iso] || 0,
        });
      }
      return daily;
    };

    const dailyViews = await aggregateDaily("page_view");
    const dailyClicks = await aggregateDaily("button_click");

    // Daily property views
    const propertyDailyMap = {};
    for (const v of propertyViews) {
      const dateKey = format(new Date(v.createdAt), "yyyy-MM-dd");
      propertyDailyMap[dateKey] = (propertyDailyMap[dateKey] || 0) + 1;
    }

    const dailyPropertyViews = [];
    for (let i = 0; i < range; i++) {
      const d = subDays(now, range - 1 - i);
      const iso = format(d, "yyyy-MM-dd");
      dailyPropertyViews.push({
        date: iso,
        label: format(d, "MMM d"),
        count: propertyDailyMap[iso] || 0,
      });
    }

    // Weekly traffic (last 7 days)
    const weeklyTraffic = dailyViews.slice(-7).map((d) => ({ ...d, count: d.count || 0 }));

    /* ------------------------ MONTHLY LISTINGS (last 12 months) ------------------------ */
    const monthlyListingActivity = [];
    const monthlyGroups = {};

    // Pre-fill last 12 months with 0
    for (let i = 11; i >= 0; i--) {
      const d = subMonths(now, i);
      const name = format(d, "MMM yyyy");
      monthlyGroups[name] = 0;
    }

    // Count properties per month (use all properties)
    const allProperties = await Property.find({}).lean();
    for (const p of allProperties) {
      const name = format(new Date(p.createdAt), "MMM yyyy");
      if (monthlyGroups[name] !== undefined) monthlyGroups[name] += 1;
    }

    // Convert to array for chart
    for (let i = 11; i >= 0; i--) {
      const d = subMonths(now, i);
      const name = format(d, "MMM yyyy");
      monthlyListingActivity.push({ name, count: monthlyGroups[name] || 0 });
    }



    /* ------------------------ DAILY VISITORS ------------------------ */
    // Aggregate unique IPs per day
    const rawDailyVisitors = await VisitorLog.aggregate([
      {
        $match: {
          createdAt: { $gte: sinceDate, $lte: untilDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            ip: "$ip",
          },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyVisitors = [];
    for (let i = 0; i < range; i++) {
      const d = subDays(now, range - 1 - i);
      const iso = format(d, "yyyy-MM-dd");
      const found = rawDailyVisitors.find((r) => r._id === iso);
      dailyVisitors.push({
        date: iso,
        label: format(d, "MMM d"),
        count: found ? found.count : 0,
      });
    }

    /* ------------------------ RESPONSE ------------------------ */
    return NextResponse.json({
      totalPageViews,
      totalVisitors: totalVisitors.length,
      totalClicks,
      dailyViews,
      dailyClicks,
      dailyVisitors,
      dailyPropertyViews,
      weeklyTraffic,
      topPages,
      topLocations,
      topViewedProperties,
      topEngagedProperties,
      monthlyListingActivity,
    });
  } catch (err) {
    console.error("Real Estate Analytics Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
