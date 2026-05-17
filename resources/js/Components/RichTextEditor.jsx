import { useEffect, useRef, useState } from 'react';

/**
 * Minimal WYSIWYG editor. No npm dependency — uses contentEditable +
 * document.execCommand for the toolbar actions. Controlled: the parent
 * owns the HTML string and re-renders us via the `value` prop.
 *
 * Props:
 *   value         — current HTML string
 *   onChange(html)— called whenever the contents change
 *   placeholder   — shown when the editor is empty
 *   error         — string; renders a red ring + message below
 *   id            — for label htmlFor / accessibility
 *   minHeight     — CSS min-height for the editor area (default '120px')
 */
export default function RichTextEditor({
    value = '',
    onChange,
    placeholder = '',
    error = null,
    id,
    minHeight = '120px',
}) {
    const editorRef = useRef(null);
    const lastEmittedRef = useRef(value);
    const [focused, setFocused] = useState(false);

    // Sync incoming `value` into the contentEditable only when it actually
    // differs from what the editor is showing. Skipping when it matches
    // prevents the cursor from jumping every keystroke.
    useEffect(() => {
        const el = editorRef.current;
        if (!el) return;
        if (value !== lastEmittedRef.current) {
            el.innerHTML = value || '';
            lastEmittedRef.current = value || '';
        }
    }, [value]);

    const emit = () => {
        const html = editorRef.current?.innerHTML || '';
        lastEmittedRef.current = html;
        onChange?.(html);
    };

    const exec = (command, arg = null) => {
        // Keep focus inside the editor so execCommand applies to the
        // user's selection. Without this, clicking a toolbar button
        // moves focus to the button and the command does nothing.
        editorRef.current?.focus();
        document.execCommand(command, false, arg);
        emit();
    };

    const promptLink = () => {
        const selectedUrl = document.getSelection()?.toString();
        const url = window.prompt('Link URL', selectedUrl?.startsWith('http') ? selectedUrl : 'https://');
        if (!url) return;
        if (url === 'unlink') {
            exec('unlink');
            return;
        }
        exec('createLink', url);
    };

    const isEmpty = !value || value === '<br>' || value === '<p></p>';

    return (
        <div>
            <div className={`rounded-md border ${error ? 'border-red-300 ring-1 ring-red-300' : focused ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-300'} bg-white shadow-sm overflow-hidden`}>
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
                    <ToolbarButton onClick={() => exec('bold')} title="Bold (Ctrl/Cmd-B)">
                        <span className="font-bold">B</span>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => exec('italic')} title="Italic (Ctrl/Cmd-I)">
                        <span className="italic">I</span>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => exec('underline')} title="Underline (Ctrl/Cmd-U)">
                        <span className="underline">U</span>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => exec('strikeThrough')} title="Strikethrough">
                        <span className="line-through">S</span>
                    </ToolbarButton>

                    <ToolbarDivider />

                    <ToolbarButton onClick={() => exec('formatBlock', '<h2>')} title="Heading 2">
                        <span className="font-semibold text-xs">H2</span>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => exec('formatBlock', '<h3>')} title="Heading 3">
                        <span className="font-semibold text-xs">H3</span>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => exec('formatBlock', '<p>')} title="Paragraph">
                        <span className="text-xs">P</span>
                    </ToolbarButton>

                    <ToolbarDivider />

                    <ToolbarButton onClick={() => exec('insertUnorderedList')} title="Bulleted list">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => exec('insertOrderedList')} title="Numbered list">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 6h13M7 12h13M7 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => exec('formatBlock', '<blockquote>')} title="Quote">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h6v4l-2 6H3l2-6V7zm12 0h6v4l-2 6h-4l2-6V7z"/></svg>
                    </ToolbarButton>

                    <ToolbarDivider />

                    <ToolbarButton onClick={promptLink} title="Insert link">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => exec('unlink')} title="Remove link">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364l-12.728-12.728M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"/></svg>
                    </ToolbarButton>

                    <ToolbarDivider />

                    <ToolbarButton onClick={() => exec('removeFormat')} title="Clear formatting">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 4h12M9 4v12m6-12v8m-9 4l12-12"/></svg>
                    </ToolbarButton>
                </div>

                {/* Editor surface */}
                <div className="relative">
                    {isEmpty && !focused && placeholder && (
                        <div className="pointer-events-none absolute inset-0 px-3 py-2 text-sm text-gray-400 select-none">
                            {placeholder}
                        </div>
                    )}
                    <div
                        id={id}
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        role="textbox"
                        aria-multiline="true"
                        spellCheck
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        onInput={emit}
                        onPaste={(e) => {
                            // Strip styles on paste so the editor doesn't
                            // inherit Word/Google Docs styling.
                            e.preventDefault();
                            const text = (e.clipboardData || window.clipboardData).getData('text/plain');
                            document.execCommand('insertText', false, text);
                        }}
                        className="prose prose-sm max-w-none px-3 py-2 text-sm text-gray-900 focus:outline-none [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-indigo-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic"
                        style={{ minHeight }}
                    />
                </div>
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}

function ToolbarButton({ onClick, title, children }) {
    return (
        <button
            type="button"
            onMouseDown={(e) => {
                // Prevent the click from stealing selection focus before
                // execCommand runs against the current selection.
                e.preventDefault();
            }}
            onClick={onClick}
            title={title}
            className="inline-flex h-7 min-w-[28px] items-center justify-center rounded px-1.5 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
        >
            {children}
        </button>
    );
}

function ToolbarDivider() {
    return <span className="mx-1 h-5 w-px bg-gray-300" aria-hidden="true" />;
}
