
/**
 * Generated using theia-plugin-generator
 */

import * as theia from '@theia/plugin';

// authoring a backend plugin we can use any of npm packages
// let's use this beautifier library to build a formatter plugin
import jsbeautify = require('js-beautify');

export function start(context: theia.PluginContext) {

    // register two formatting providers
    // for each of supported languages
    ['javascript', 'html', 'css'].forEach(selector => registerFormattingProviders(context, selector));
}

/**
 * Registers document formatting provider and range formatting provider for a given document selector.
 * @param context a plugin context
 * @param selector document selector
 */
function registerFormattingProviders(context: theia.PluginContext, selector: theia.DocumentSelector): void {
    context.subscriptions.push(
        // register a document formatting provider
        theia.languages.registerDocumentFormattingEditProvider(selector, {
            provideDocumentFormattingEdits: (document: theia.TextDocument, options: theia.FormattingOptions) => {
                return formatDocument(document, options);
            }
        })
    );

    context.subscriptions.push(
        // register a document range formatting provider
        theia.languages.registerDocumentRangeFormattingEditProvider(selector, {
            provideDocumentRangeFormattingEdits: (document: theia.TextDocument, range: theia.Range, options: theia.FormattingOptions) => {
                return formatDocument(document, options, range);
            }
        })
    );
}

/**
 * Returns an array of edits that should be applied to a document.
 * @param document represents a text document
 * @param options formatting options
 * @param range represents start and end of selection
 */
function formatDocument(document: theia.TextDocument, options: theia.FormattingOptions, range?: theia.Range): theia.TextEdit[] {
    // if range is not provided then let's create it for the whole document
    if (!range) {
        const positionStart = new theia.Position(0, 0);
        const positionEnd = new theia.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
        range = new theia.Range(positionStart, positionEnd);
    }

    // get text for the range
    const content = document.getText(range);
    // get options for js-beautify
    const opts = getBeautifyOpts(options);
    // get beautify function for a given languageId
    const beautifyFn = getBeautifyFunction(document.languageId);

    if (!beautifyFn) {
        return [];
    }

    // format the text using js-beautify
    const contentFormatted = beautifyFn(content, opts);
    if (!contentFormatted) {
        return [];
    }

    return [new theia.TextEdit(range, contentFormatted)];
}

/**
 * Returns js-beautify options object based on Theia's formatting options.
 * @param options
 */
function getBeautifyOpts(options: theia.FormattingOptions): JsBeautifyOptions {
    return {
        indent_size: options.tabSize,
        indent_with_tabs: !options.insertSpaces
    };
}

/**
 * Returns a beautify function for a given language ID.
 * @param languageId document's language ID
 */
function getBeautifyFunction(languageId: string): Function | undefined {
    switch (languageId) {
        case 'css':
            return jsbeautify.css;
        case 'javascript':
            return jsbeautify.js;
        case 'html':
            return jsbeautify.html;
        default:
            console.error(`Language "${languageId}" is not supported!`);
    }
}

export function stop() {

}
