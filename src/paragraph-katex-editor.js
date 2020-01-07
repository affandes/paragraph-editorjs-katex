import katex from "katex"
import './style.css'


export default class ParagraphKatexEditor {

    constructor({data, config, api}) {
        this.api = api;
        this.data = {
            text: ''
        };
        this.config = {
            plugins: {
                katex: {
                    delimiter: '$$'
                }
            }
        };

        this.hasEditMode = false;
        this.paragraph = null;

        this.navKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'];

        Object.assign(this.data, data);
        Object.assign(this.config, config);
    }

    render() {
        this._setupParagraph();

        return this.paragraph;
    }

    _setupParagraph() {
        // Init node
        this.paragraph = document.createElement('p');
        this.paragraph.classList.add(ParagraphKatexEditor.CLASS.paragraph);
        this.paragraph.contentEditable = true;
        // Setup listeners
        this.api.listeners.on(this.paragraph, 'input', (e) => {
            this._inputListener(e);
        }, false);
        this.api.listeners.on(this.paragraph, 'keyup', (e) => {
            this._keyupListener(e);
        }, false);
        this.api.listeners.on(this.paragraph, 'click', (e) => {
            this._clickListener(e);
        }, false);
        this.api.listeners.on(this.paragraph, 'blur', (e) => {
            this._blurListener(e);
        }, false);

    }

    _keyupListener(e) {
        if( this.navKeys.indexOf(e.key) >= 0 ) {
            const caret = this._getRange();
            let parent = caret.startContainer.parentNode;
            if( caret.startContainer.parentNode.isEqualNode(this.paragraph) ) {
                this._viewMode();
            }
        }

    }

    _clickListener(e) {
        const caret = this._getRange();
        if( caret.startContainer.parentNode.isEqualNode(this.paragraph) ) {
            this._viewMode();
        } else {
            let parent = this.api.selection.findParentTag('SPAN', ParagraphKatexEditor.CLASS.katex.viewer);
            if( !!parent ) {
                parent.previousSibling.hidden = false;
                caret.setStart(parent.previousSibling, 0);
                caret.setEnd(caret.startContainer, 0);
            } else {
                // Nothing to do
            }
        }
    }

    _blurListener(e) {
        this._viewMode();
    }
    _inputListener(e) {
        if( e.data === ' ' ) {
            return;
        }

        const caret = this._getRange();
        let parent = caret.startContainer.parentNode;
        if( caret.startContainer.parentNode.isEqualNode(this.paragraph) ) {
            // Listen in root paragraph

            this._viewMode();

            let toolNames = Object.keys(this.config.plugins);
            if( e.inputType === 'insertText' ) {
                // Add
                for (let i = 0; i < toolNames.length; i++) {
                    let delimiter = this.config.plugins[toolNames[i]].delimiter;
                    if( delimiter.length < 1 ) {
                        continue;
                    } else if( e.data === delimiter.substr(-1) ) {
                        if( this._checkDelimiter(toolNames[i]) ) {
                            this._createPluginBlock(toolNames[i]);
                            break;
                        }
                    }
                }



            } else if( e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward' || e.inputType === 'deleteByCut' || e.inputType === 'insertFromDrop'  ) {
                // Nothing to do yet...
            } else {
                // Nothing to do yet...
            }

        } else {
            // Listen in plugins
            if( parent.tagName === 'SPAN' ) {
                // if( caret.startContainer.textContent.length > 0 ) {
                    katex.render(caret.startContainer.textContent.length > 0 ? caret.startContainer.textContent : '?', parent.nextSibling, {
                        throwOnError: false
                    });
                // } else {
                //     caret.startContainer.nextSibling.innerHtml = '???'
                // }
            } else {
                // Nothing to do
            }
        }

    }

    _viewMode() {
        if( this.hasEditMode ) {
            let children = this.paragraph.childNodes;
            for (let i = 0; i < children.length; i++) {
                if( children[i].nodeName === 'SPAN' ) {
                    children[i].firstChild.hidden = true;
                }
            }
        }
    }

    _checkDelimiter(pluginName) {
        const caret = this._getRange();
        const delimiter = this.config.plugins[pluginName].delimiter;
        const del = ' ' + delimiter;
        if( caret.startOffset === delimiter.length ) {
            if( caret.startContainer.textContent.substr(0, delimiter.length) === delimiter ) {
                console.log('Gotcha...');
                return true;
            }
        } else if( caret.startOffset > delimiter.length ) {
            if( caret.startContainer.textContent.substr(caret.startOffset-del.length, del.length) === del ) {
                console.log('Zing...');
                return true;
            }
        }
        return false;
    }

    _getRange() {
        return window.getSelection().getRangeAt(0);
    }

    _createPluginBlock(pluginName) {
        const caret = this._getRange();
        const delimiter = this.config.plugins[pluginName].delimiter;
        // Select delimiter
        caret.setStart(caret.startContainer, caret.startOffset-delimiter.length);
        caret.deleteContents();
        // Add space at end
        caret.insertNode(document.createTextNode('\xa0'));
        // Add plugin node
        const block = document.createElement('SPAN');
        const editor = document.createElement('SPAN');
        const viewer = document.createElement('SPAN');
        block.classList.add(ParagraphKatexEditor.CLASS.katex.wrapper);
        editor.classList.add(ParagraphKatexEditor.CLASS.katex.editor);
        viewer.classList.add(ParagraphKatexEditor.CLASS.katex.viewer);
        viewer.contentEditable = false;
        block.appendChild(editor);
        block.appendChild(viewer);
        caret.insertNode(block);
        // Set caret
        caret.setStart(caret.startContainer.nextSibling.firstChild, 0);
        caret.setEnd(caret.startContainer, 0);
        this.hasEditMode = true;
    }

    save(content) {
        return {
            text: content.trim()
        }
    }

    static get toolbox() {
        return {
            title: 'ParagraphKatexEditor',
            icon: '<svg width="16" height="16" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M29.425 22.96l1.387-2.96h1.188l-2 12h-30v-2.32l10.361-12.225-10.361-10.361v-7.094h30.625l1.375 8h-1.074l-0.585-1.215c-1.104-2.293-1.934-2.785-4.341-2.785h-20.688l11.033 11.033-9.294 10.967h16.949c3.625 0 4.583-1.299 5.425-3.040z"/></svg>'
        };
    }

    static get CLASS() {
        return {
            paragraph: 'aff-para-editor',
            katex: {
                wrapper: 'aff-katex-inline-wrapper',
                editor: 'aff-katex-inline-editor',
                viewer: 'aff-katex-inline-viewer'
            }
        }
    }

}