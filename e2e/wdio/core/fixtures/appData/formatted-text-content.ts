export default {
    link_dist_url: ' http://loripsum.net',
    html_input_text: '<h1>Title h1</h1>\n' +
        '<p>Paragraph with link <a href=\'http://loripsum.net/\' target=\'_blank\'>Link to http://loripsum.net.</a> </p>\n' +
        '<blockquote cite=\'http://loripsum.net\'>\n' +
        'Blockquote with cite\n' +
        '</blockquote>\n' +
        '<h3>ordered list of items</h3>\n' +
        '<ol>\n' +
        '<li>ordered list\'s item 1</li>\n' +
        '<li style="color: red;">ordered list\'s item 2 with style="color: red;"</li>\n' +
        '<li>ordered list\'s item 3</li>\n' +
        '</ol>\n' +
        '<h3>unordered list of items</h3>\n' +
        '<ul>\n' +
        '<li>unordered list\'s item 1</li>\n' +
        '<li>unordered list\'s item 2</li>\n' +
        '<li>unordered list\'s item 3</li>\n' +
        '</ul>\n' +
        '<h1>Wrong link href will skipped</h1>\n' +
        '<a href="google.com" title="Redirect to google.com" style="color:#1a0dab;font-size:14px;">Link with wrong href google.com (instead http://www.google.com), title and style</a>\n' +
        '<h1>Link with anchor</h1>\n' +
        '<a href="#target1" title="Redirect to google.com">Anchor link to #target1</a>',
    html_input_text_2: '<h1>Title h1</h1>\n' +
        '<p>Paragraph with link <a href=\'http://loripsum.net/\' target=\'_blank\'>Link to http://loripsum.net.</a> </p>\n' +
        '<blockquote cite=\'http://loripsum.net\'>\n' +
        'Blockquote with cite\n' +
        '</blockquote>\n' +
        '<h3>ordered list of items</h3>\n' +
        '<ol>\n' +
        '<li>ordered list\'s item 1</li>\n',

    html_input_second: '<a href="https://www.sap.com" target="_blank">Link to sap.com with target "_self" (will change if already exists)</a>',
    loripsum_link_href: 'http://loripsum.net/',
    google_link_href: 'google.com',
    sap_link_href: 'https://www.sap.com',
    anchor_href: '#target1',
    target_self: '_self',
    target_blank: '_blank',
    custom_style_1: 'color: red;',
    custom_style_2: 'color: rgb(26, 13, 171); font-size: 14px;',
    custom_style_2_FF: 'color:#1a0dab;font-size:14px;'
}
