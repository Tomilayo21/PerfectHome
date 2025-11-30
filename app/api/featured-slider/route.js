// // app/api/featured-slider/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/config/db";
// import FeaturedSlide from "@/models/FeaturedSlide";
// import Property from "@/models/Property";
// import { requireAdmin } from "@/lib/authAdmin"; // optional: keep for admin protection

// export async function GET() {
//   try {
//     await connectDB();

//     const now = new Date();

//     // Auto-deactivate expired slides before returning results
//     await FeaturedSlide.updateMany(
//       { offerEnd: { $lte: now }, active: true },
//       { $set: { active: false } }
//     );


//     // Fetch only active slides after cleanup
//     const slides = await FeaturedSlide.find({ active: true })
//       .sort({ position: 1 })
//       .lean();

//     return NextResponse.json({ success: true, slides }, { status: 200 });

//   } catch (err) {
//     console.error("GET featured-slider error:", err);
//     return NextResponse.json({ success: false, error: err.message }, { status: 500 });
//   }
// }


// export async function POST(request) {
//   try {
//     // uncomment if you require admin
//     const adminUser = await requireAdmin(request);
//     if (adminUser instanceof NextResponse) return adminUser;
//     if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     await connectDB();
//     const body = await request.json();

//     const {
//       propertyId,
//       deal,
//       sale,
//       offerEnd, // ISO string or null
//       buttonText,
//       buttonLink,
//       overrideImg, // optional url
//       position = 0,
//       active = true,
//     } = body;

//     if (!propertyId) {
//       return NextResponse.json({ success: false, error: "propertyId required" }, { status: 400 });
//     }

//     // fetch property to snapshot
//     const property = await Property.findById(propertyId).lean();
//     if (!property) {
//       return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 });
//     }

//     const snapshot = {
//       title: property.title,
//       price: property.price,
//       location: `${property.city}, ${property.state}`,
//       imgSrc: overrideImg || (property.images?.[0] ?? null),
//       city: property.city,
//       state: property.state,
//       bedrooms: property.bedrooms,
//       bathrooms: property.bathrooms,
//       category: property.category,
//     };

//     // upsert: if a slide already exists for this property update it; otherwise create
//     const existing = await FeaturedSlide.findOne({ propertyId });
//     let slide;
//     if (existing) {
//       existing.snapshot = snapshot;
//       existing.deal = deal ?? existing.deal;
//       existing.sale = sale ?? existing.sale;
//       existing.offerEnd = offerEnd ? new Date(offerEnd) : existing.offerEnd;
//       existing.buttonText = buttonText ?? existing.buttonText;
//       existing.buttonLink = buttonLink ?? existing.buttonLink;
//       existing.position = position;
//       existing.active = true;

//       slide = await existing.save();
//     } else {
//       slide = await FeaturedSlide.create({
//         propertyId,
//         snapshot,
//         deal,
//         sale,
//         offerEnd: offerEnd ? new Date(offerEnd) : null,
//         buttonText,
//         buttonLink,
//         position,
//         active: true,
//       });
//     }

//     return NextResponse.json({ success: true, slide }, { status: 200 });
//   } catch (err) {
//     console.error("POST featured-slider error:", err);
//     return NextResponse.json({ success: false, error: err.message }, { status: 500 });
//   }
// }

// export async function DELETE(request) {
//   try {
//     const adminUser = await requireAdmin(request);
//     if (adminUser instanceof NextResponse) return adminUser;
//     if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     await connectDB();
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get("id");
//     if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

//     // Soft-delete
//     await FeaturedSlide.findByIdAndUpdate(id, { active: false });

//     return NextResponse.json({ success: true }, { status: 200 });
//   } catch (err) {
//     console.error("DELETE featured-slider error:", err);
//     return NextResponse.json({ success: false, error: err.message }, { status: 500 });
//   }
// }



































































// app/api/featured-slider/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import FeaturedSlide from "@/models/FeaturedSlide";
import Property from "@/models/Property";
import { requireAdmin } from "@/lib/authAdmin";

/**
 * Helper: normalize a value to a Date or null
 */
function parseDateOrNull(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Helper: compute whether a slide should be active given an offerEnd date and now.
 * - active if no offerEnd
 * - active if offerEnd > now
 * - inactive if offerEnd <= now
 */
function computeActiveFromOfferEnd(offerEndDate, now = new Date()) {
  if (!offerEndDate) return true;
  return offerEndDate.getTime() > now.getTime();
}

/**
 * GET: return all active slides (position-sorted)
 * Before returning, auto-deactivate slides whose offerEnd exists & is <= now
 */
export async function GET(request) {
  try {
    await connectDB();
    const now = new Date();

    // Auto-deactivate expired slides
    await FeaturedSlide.deleteMany({
      offerEnd: { $lte: now }
    });


    // Fetch ALL slides — not just active
    const slides = await FeaturedSlide.find({})
      .sort({ position: 1 })
      .lean();

    return NextResponse.json({ success: true, slides }, { status: 200 });

  } catch (err) {
    console.error("GET featured-slider error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


/**
 * POST: upsert a slide (requires admin)
 *
 * Request body:
 * {
 *   propertyId,
 *   deal,
 *   sale,
 *   offerEnd (ISO string or null),
 *   buttonText,
 *   buttonLink,
 *   overrideImg,
 *   position (optional integer)   // where to place the slide in the order
 *   active (optional boolean)     // note: computed from offerEnd - this param can be ignored/overridden
 * }
 *
 * Behavior:
 * - Validates property exists
 * - Creates a snapshot of the property
 * - If slide for property exists -> update snapshot + fields
 * - If not -> create new slide and insert at requested position (or at end)
 * - Reindexes positions to be contiguous (0..N-1)
 * - Ensures active is set based on offerEnd validity (expired => active:false)
 */
export async function POST(request) {
  try {
    // admin guard (optional; keep or remove if not desired)
    const adminUser = await requireAdmin(request);
    if (adminUser instanceof NextResponse) return adminUser;
    if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await request.json();

    const {
      propertyId,
      deal,
      sale,
      offerEnd, // ISO string or null
      buttonText,
      buttonLink,
      overrideImg,
      position: requestedPosition,
    } = body;

    if (!propertyId) {
      return NextResponse.json({ success: false, error: "propertyId required" }, { status: 400 });
    }

    // fetch property to snapshot
    const property = await Property.findById(propertyId).lean();
    if (!property) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 });
    }

    const snapshot = {
      title: property.title,
      price: property.price,
      location: `${property.city}, ${property.state}`,
      imgSrc: overrideImg || (property.images?.[0] ?? null),
      city: property.city,
      state: property.state,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      category: property.category,
    };

    const offerEndDate = parseDateOrNull(offerEnd);
    const now = new Date();
    const computedActive = computeActiveFromOfferEnd(offerEndDate, now);

    // Get all slides to handle reindexing/positioning
    const allSlides = await FeaturedSlide.find({}).sort({ position: 1 }).exec();

    // find existing by propertyId
    const existingIndex = allSlides.findIndex((s) => String(s.propertyId) === String(propertyId));

    // Helper to reindex an array of documents and persist positions
    async function persistPositions(arr) {
      // arr is a list of slide docs in desired order
      for (let i = 0; i < arr.length; i++) {
        const slideDoc = arr[i];
        if (String(slideDoc.position) !== String(i)) {
          slideDoc.position = i;
          // Save only if mongoose doc (has save) or do an update
          if (typeof slideDoc.save === "function") {
            // slideDoc could be a mongoose doc - save it
            // eslint-disable-next-line no-await-in-loop
            await slideDoc.save();
          } else {
            // fallback - update by id
            // eslint-disable-next-line no-await-in-loop
            await FeaturedSlide.findByIdAndUpdate(slideDoc._id, { position: i });
          }
        }
      }
    }

    let slideResult;

    if (existingIndex > -1) {
      // Update existing slide: update snapshot + fields and set active based on offerEnd
      const existing = allSlides[existingIndex];
      existing.snapshot = snapshot;
      existing.deal = deal ?? existing.deal;
      existing.sale = sale ?? existing.sale;
      // if (offerEnd !== undefined) {
      //   existing.offerEnd = offerEndDate;
      // }

      existing.buttonText = buttonText ?? existing.buttonText;
      existing.buttonLink = buttonLink ?? existing.buttonLink;
      existing.overrideImg = overrideImg ?? existing.overrideImg;
      // existing.active = computedActive;

      // Only overwrite offerEnd if user explicitly sent something
      if (body.hasOwnProperty("offerEnd")) {
        existing.offerEnd = offerEndDate;
      }

      // Recompute active ONLY from the updated offerEnd (or existing one)
      const newOfferEnd = offerEndDate ?? existing.offerEnd;
      existing.active = computeActiveFromOfferEnd(newOfferEnd);


      // If requestedPosition is provided, move the slide to that position in ordering
      if (typeof requestedPosition === "number" && requestedPosition >= 0) {
        const without = allSlides.filter((s) => String(s.propertyId) !== String(propertyId));
        const pos = Math.min(requestedPosition, without.length);
        without.splice(pos, 0, existing);
        await persistPositions(without);
        slideResult = await FeaturedSlide.findById(existing._id).lean();
      } else {
        // just save and reindex (positions unchanged)
        await existing.save();
        slideResult = existing.toObject ? existing.toObject() : existing;
      }
    } else {
      // Create new slide
      // Determine position: if requestedPosition provided, insert; else append at end
      const insertPos = typeof requestedPosition === "number" && requestedPosition >= 0
        ? Math.min(requestedPosition, allSlides.length)
        : allSlides.length;

      // create doc (position will be temporary)
      const created = await FeaturedSlide.create({
        propertyId,
        snapshot,
        deal,
        sale,
        offerEnd: offerEndDate || null,
        buttonText,
        buttonLink,
        overrideImg: overrideImg || null,
        position: insertPos,
        active: computedActive,
      });

      // Build new ordering: insert created at insertPos
      const updatedOrder = [
        ...allSlides.slice(0, insertPos),
        created,
        ...allSlides.slice(insertPos),
      ];

      // persist positions in order
      await persistPositions(updatedOrder);

      slideResult = await FeaturedSlide.findById(created._id).lean();
    }

    // return the upserted slide (fresh)
    return NextResponse.json({ success: true, slide: slideResult }, { status: 200 });
  } catch (err) {
    console.error("POST featured-slider error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * DELETE: soft-delete a slide (requires admin)
 * Query param: ?id=slideId
 *
 * Behavior:
 * - set active = false
 * - reindex positions so there are no gaps
 */
export async function DELETE(request) {
  try {
    const adminUser = await requireAdmin(request);
    if (adminUser instanceof NextResponse) return adminUser;
    if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

    // Hard delete
    const slide = await FeaturedSlide.findByIdAndDelete(id).exec();
    if (!slide) {
      return NextResponse.json({ success: false, error: "Slide not found" }, { status: 404 });
    }

    // Reindex remaining slides
    const remaining = await FeaturedSlide.find({}).sort({ position: 1 }).exec();
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].position !== i) {
        remaining[i].position = i;
        await remaining[i].save();
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE featured-slider error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

