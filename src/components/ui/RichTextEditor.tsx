import React, { useRef, useCallback, useState } from "react";
import {
  FaBold,
  FaImage,
  FaItalic,
  FaLink,
  FaListOl,
  FaListUl,
  FaQuoteRight,
  FaUnderline,
} from "react-icons/fa";

type Props = {
  reportText: string;
  setReportText: React.Dispatch<React.SetStateAction<string>>;
};

export default function RichTextEditor({ reportText, setReportText }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  // Execute formatting command
  const executeCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateActiveFormats();
  }, []);

  // Update active formats based on current selection
  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();

    if (document.queryCommandState("bold")) formats.add("bold");
    if (document.queryCommandState("italic")) formats.add("italic");
    if (document.queryCommandState("underline")) formats.add("underline");
    if (document.queryCommandState("insertOrderedList")) formats.add("ol");
    if (document.queryCommandState("insertUnorderedList")) formats.add("ul");

    setActiveFormats(formats);
  }, []);

  // Check if editor has actual text content (including spaces)
  const hasTextContent = useCallback(() => {
    if (!editorRef.current) return false;
    const textContent = editorRef.current.textContent || "";
    return textContent.length > 0;
  }, []);

  // Handle content changes
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setReportText(content);
      updateActiveFormats();

      // Update placeholder visibility
      const hasText = hasTextContent();
      editorRef.current.classList.toggle("has-content", hasText);
    }
  }, [setReportText, updateActiveFormats, hasTextContent]);

  // Handle selection changes
  const handleSelectionChange = useCallback(() => {
    updateActiveFormats();
  }, [updateActiveFormats]);

  // Handle key down events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Handle common keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "b":
            e.preventDefault();
            executeCommand("bold");
            break;
          case "i":
            e.preventDefault();
            executeCommand("italic");
            break;
          case "u":
            e.preventDefault();
            executeCommand("underline");
            break;
        }
      }
    },
    [executeCommand]
  );

  // Insert link
  const insertLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (url) {
      executeCommand("createLink", url);
    }
  }, [executeCommand]);

  // Insert blockquote
  const insertBlockquote = useCallback(() => {
    executeCommand("formatBlock", "blockquote");
  }, [executeCommand]);

  // Handle image upload
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = `<img src="${event.target?.result}" alt="Uploaded image" style="max-width: 100%; height: auto;" />`;
          executeCommand("insertHTML", img);
        };
        reader.readAsDataURL(file);
      }
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [executeCommand]
  );

  // Set initial content when reportText changes externally
  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== reportText) {
      editorRef.current.innerHTML = reportText;

      // Update placeholder visibility
      const hasText = hasTextContent();
      editorRef.current.classList.toggle("has-content", hasText);
    }
  }, [reportText, hasTextContent]);

  // Add selection change listener
  React.useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [handleSelectionChange]);

  const getButtonClass = (format: string) => {
    const baseClass = "p-2 rounded cursor-pointer transition-colors";
    const activeClass = "bg-blue-500 text-white";
    const inactiveClass = "hover:bg-gray-200";

    return `${baseClass} ${
      activeFormats.has(format) ? activeClass : inactiveClass
    }`;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
        <button
          type="button"
          className={getButtonClass("bold")}
          onClick={() => executeCommand("bold")}
          aria-label="Bold"
        >
          <FaBold size={12} />
        </button>
        <button
          type="button"
          className={getButtonClass("italic")}
          onClick={() => executeCommand("italic")}
          aria-label="Italic"
        >
          <FaItalic size={12} />
        </button>
        <button
          type="button"
          className={getButtonClass("underline")}
          onClick={() => executeCommand("underline")}
          aria-label="Underline"
        >
          <FaUnderline size={12} />
        </button>
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          className="p-2 hover:bg-gray-200 rounded cursor-pointer transition-colors"
          onClick={insertBlockquote}
          aria-label="Quote"
        >
          <FaQuoteRight size={12} />
        </button>
        <button
          type="button"
          className={getButtonClass("ul")}
          onClick={() => executeCommand("insertUnorderedList")}
          aria-label="Bullet List"
        >
          <FaListUl size={12} />
        </button>
        <button
          type="button"
          className={getButtonClass("ol")}
          onClick={() => executeCommand("insertOrderedList")}
          aria-label="Numbered List"
        >
          <FaListOl size={12} />
        </button>
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          className="p-2 hover:bg-gray-200 rounded cursor-pointer transition-colors"
          onClick={insertLink}
          aria-label="Link"
        >
          <FaLink size={12} />
        </button>
        <button
          type="button"
          className="p-2 hover:bg-gray-200 rounded cursor-pointer transition-colors"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Image"
        >
          <FaImage size={12} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="rich-editor w-full p-2 min-h-[92px] max-h-38 overflow-y-auto focus:outline-none"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        style={{
          whiteSpace: "pre-wrap",
        }}
        suppressContentEditableWarning={true}
      />

      {/* Custom styles for the editor content */}
      <style>{`
        .rich-editor:not(.has-content):before {
          content: 'Enter your report here...';
          color: #9ca3af;
          pointer-events: none;
        }
        
        .rich-editor blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 0.5rem 0;
          color: #6b7280;
          font-style: italic;
        }
        
        .rich-editor ul {
          list-style-type: disc;
          margin-left: 1.5rem;
          margin: 0.5rem 0 0.5rem 1.5rem;
        }
        
        .rich-editor ol {
          list-style-type: decimal;
          margin: 0.5rem 0 0.5rem 1.5rem;
        }
        
        .rich-editor li {
          margin: 0.25rem 0;
        }
        
        .rich-editor a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .rich-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
}
