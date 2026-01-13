import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { cn } from '../utils/cn';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

const formats = [
  'header', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet',
  'align',
  'link', 'image', 'video'
];

const RichTextEditor = ({ value, onChange, placeholder, className }) => {
  return (
    <div className={cn("rich-text-editor bg-white rounded-2xl overflow-hidden border border-gray-100 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all", className)}>
      <style>{`
        .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #f3f4f6;
          padding: 12px;
          background: #f9fafb;
        }
        .ql-container.ql-snow {
          border: none;
          font-family: inherit;
          font-size: 1rem;
        }
        .ql-editor {
          min-height: 200px;
          padding: 16px 24px;
        }
        .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
          font-weight: 500;
          left: 24px;
        }
        .ql-snow.ql-toolbar button:hover,
        .ql-snow .ql-toolbar button:hover,
        .ql-snow.ql-toolbar button:focus,
        .ql-snow .ql-toolbar button:focus,
        .ql-snow.ql-toolbar button.ql-active,
        .ql-snow .ql-toolbar button.ql-active,
        .ql-snow.ql-toolbar .ql-picker-label:hover,
        .ql-snow .ql-toolbar .ql-picker-label:hover,
        .ql-snow.ql-toolbar .ql-picker-label.ql-active,
        .ql-snow .ql-toolbar .ql-picker-label.ql-active,
        .ql-snow.ql-toolbar .ql-picker-item:hover,
        .ql-snow .ql-toolbar .ql-picker-item:hover,
        .ql-snow.ql-toolbar .ql-picker-item.ql-selected,
        .ql-snow .ql-toolbar .ql-picker-item.ql-selected {
          color: #2563eb;
        }
        .ql-snow.ql-toolbar button:hover .ql-stroke,
        .ql-snow .ql-toolbar button:hover .ql-stroke,
        .ql-snow.ql-toolbar button:focus .ql-stroke,
        .ql-snow .ql-toolbar button:focus .ql-stroke,
        .ql-snow.ql-toolbar button.ql-active .ql-stroke,
        .ql-snow .ql-toolbar button.ql-active .ql-stroke,
        .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke,
        .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke,
        .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke,
        .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke,
        .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke,
        .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke,
        .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
        .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke {
          stroke: #2563eb;
        }

        /* Custom labels for the pickers to avoid double "Normal" */
        .ql-picker.ql-header .ql-picker-label::before,
        .ql-picker.ql-header .ql-picker-item::before {
          content: 'Text Style' !important;
        }
        .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
        .ql-picker.ql-header .ql-picker-item[data-value="1"]::before { content: 'Heading 1' !important; }
        .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
        .ql-picker.ql-header .ql-picker-item[data-value="2"]::before { content: 'Heading 2' !important; }
        .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
        .ql-picker.ql-header .ql-picker-item[data-value="3"]::before { content: 'Heading 3' !important; }

        .ql-picker.ql-size .ql-picker-label::before,
        .ql-picker.ql-size .ql-picker-item::before {
          content: 'Font Size' !important;
        }
        .ql-picker.ql-size .ql-picker-label[data-value="small"]::before,
        .ql-picker.ql-size .ql-picker-item[data-value="small"]::before { content: 'Small' !important; }
        .ql-picker.ql-size .ql-picker-label[data-value="large"]::before,
        .ql-picker.ql-size .ql-picker-item[data-value="large"]::before { content: 'Large' !important; }
        .ql-picker.ql-size .ql-picker-label[data-value="huge"]::before,
        .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before { content: 'Huge' !important; }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
