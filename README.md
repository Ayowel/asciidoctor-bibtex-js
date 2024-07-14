# Asciidoctor.js bibtex extension

*This extension is a pure javascript implementation of [asciidoctor-bibtex](https://github.com/asciidoctor/asciidoctor-bibtex).*

This extension adds bibtex integration to AsciiDoc documents by introducing three new macros: `cite:[KEY]`, `bibitem:[KEY]` and `bibliography::[]`. Citations are parsed and replaced with formatted inline texts, and reference lists are automatically generated and inserted into where `bibliography::[]` is placed. `bibitem:[KEY]` will insert a rendered bibliography item directly into the text.

It is designed to be used as an extension to Asciidoctor. Thus this extension can be used together with other asciidoctor extensions such as asciidoctor-mathematical and asciidoctor-pdf to enrich your AsciiDoc experience.

## Install for the command-line

* Install this extension with `npm install @ayowel/asciidoctor-bibtex-js` (you may want to throw in a `-g` to install globally)
* Run asciidoctor and require the extension with the option `-r @ayowel/asciidoctor-bibtex-js`

Asciidoctor must also be installed for this extension to work. Asciidoctor version 2.0.0 or higher is required.

## Usage

First, you need to have a valid bibtex file.
You specify the location to this file using the `bibtex-file` document attribute.

### Macros

Syntax for inserting a citation is the following inline macro: `cite|citenp:[ref(pages), ...]` where `(pages)` is optional.

Examples of "chicago-author-date" style:

* `cite:[Lane12]` becomes "(Lane 2012)"
* `citenp:[Lane12]` becomes "Lane (2012)"
* `cite:[Lane12(59)]` becomes "(Lane 2012, 59)"

For *apa* (Harvard-like) style:

* `cite:[Lane12]` becomes "(Lane, 2012)"
* `citenp:[Lane12]` becomes "Lane (2012)"
* `cite:[Lane12(59)]` becomes "(Lane, 2012, p.59)"

For *ieee*, a numeric style:

`cite:[Lane12,Lane11]` becomes "[1, 2]"

To add a list of formatted references, place `bibliography::[]` on a line by itself.

One can use `bibitem:[Lane12]` to insert a rendered bibliography item inline, maybe to generate a cv. For example:

```adoc
= My CV

== Publications

=== 2019

- bibitem:[Me2019a]
- bibitem:[Me2019b]
- bibitem:[Me2019c]
```

### Configuration

Configuration is applied in the form of AsciiDoc document attributes, which must be defined in the document header.

| Attribute Name | Description | Valid Values | Default Value |
| -------------- | ----------- | ------------ | ------------- |
| `bibtex-file` | Bibtex database file | any string, or empty | Automatic searching
| `bibtex-style` | Reference formatting style | any style supported by csl-styles | ieee
| `bibtex-order` | Order of citations | `appearance` or `alphabetical` | `appearance`
| `bibtex-format` | Formatting of citations and bibliography | `asciidoc`, `bibtex` or `biblatex` | `asciidoc`
| `bibtex-locale` | Locale used to render the bibliography | strings supported by CSL | `en-US`
| `bibtex-throw` | Throw an error on unknown references | `true` or `false` | `false`
| `bibtex-citation-template` | Custom citation template for numeric style | Any string matching `/(.+?)\$id(.+)/` | `[$id]`

## Install to use with VSCode

You may use this extension with the `Asciidoc` extension for VSCode Desktop by doing the following:

* In the `Asciidoc` extension's settings, enable workspace extensions (`asciidoc.extensions.registerWorkspaceExtensions`)
* In your project's workspace:
  * Create a new file `package.json` with the content `{}`
  * Install this extension with `npm install --local @ayowel/asciidoctor-bibtex-js`
  * Optionally add localisation and style libraries:
    * `npm install --local @citation/csl-locale-all`
    * `npm install --local @citation/csl-style-all`
  * Create a new subdirectory `.asciidoctor/lib`
    * Create a file `.asciidoctor/lib/bibtex.js` to load the extension:

```javascript
module.exports = require('@ayowel/asciidoctor-bibtex-js')
```

## What are the main differences ?

* We do not interprete LaTeX entries in the bibtex file
* We do not try to load bibtex file from your current directory or your home's `Documents` directory. We only try to load the path provided as a `bibtex-file` or - if it is not set - we search from your document's directory
* If a biblio
