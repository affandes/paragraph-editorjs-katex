const editorjs = new EditorJS({
    autofocus: true,
    tools: {
        katex: {
            class: ParagraphKatexEditor
        },

    },
    initialBlock: 'katex'
});
