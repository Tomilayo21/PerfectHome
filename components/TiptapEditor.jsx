'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';

const TiptapEditor = ({ description, setDescription }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // disable internal heading
        listItem: false, // disable default list item to use our custom one
      }),
      Underline,
      TextStyle,
      Heading.configure({ levels: [2, 3] }),
      BulletList,
      OrderedList,
      ListItem.configure({
        // Prevent wrapping list items in <p>
        keepMarks: true,
        keepAttributes: false,
      }),
      Placeholder.configure({ placeholder: 'Type your content here...' }),
    ],
    content: description || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (typeof setDescription === 'function') {
        setDescription(editor.getHTML());
      }
    },
  });

  useEffect(() => {
    if (editor && description) {
      editor.commands.setContent(description);
    }
  }, [editor, description]);

  if (!editor) return null;

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="mb-2 flex flex-wrap gap-2">
        {/* Bold */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded border ${
            editor.isActive('bold') ? 'bg-gray-200 font-bold' : ''
          }`}
        >
          B
        </button>

        {/* Italic */}
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded border ${
            editor.isActive('italic') ? 'bg-gray-200 italic' : ''
          }`}
        >
          I
        </button>

        {/* Underline */}
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 rounded border ${
            editor.isActive('underline') ? 'bg-gray-200 underline' : ''
          }`}
        >
          U
        </button>

        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded border ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 font-semibold' : ''
          }`}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded border ${
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 font-semibold' : ''
          }`}
        >
          H3
        </button>

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded border ${
            editor.isActive('bulletList') ? 'bg-gray-200' : ''
          }`}
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded border ${
            editor.isActive('orderedList') ? 'bg-gray-200' : ''
          }`}
        >
          1. List
        </button>
      </div>

      {/* Editor */}
      <div className="border border-gray-300 p-2 min-h-[150px] max-h-[400px] overflow-y-auto rounded prose prose-sm dark:prose-invert">
        <EditorContent editor={editor} />
      </div>

      {/* Optional custom ProseMirror styles */}
      <style jsx global>{`
        .ProseMirror h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .ProseMirror h3 {
          font-size: 1.1rem;
          font-weight: 500;
          margin-top: 0.75rem;
          margin-bottom: 0.4rem;
        }
        .ProseMirror p {
          margin: 0.5rem 0;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-top: 0.5rem;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-top: 0.5rem;
        }
        .ProseMirror li {
          margin: 0.25rem 0; /* tighter spacing for list items */
        }
      `}</style>
    </div>
  );
};

export default TiptapEditor;
