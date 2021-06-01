/**
 * MyCashflow Default Theme
 * Copyright (c) 2016 Pulse247 Oy
 * MIT License <http://opensource.org/licenses/MIT>
 */
;(function ($) {
	'use strict';

	var Interface = {
		dataSelector: 'interface',

		beforeUpdate: function () {},
		afterUpdate: function () {},

		init: function (config) {
			$.extend(true, this, config);
		},

		get: function ($target) {
			var tag = $target.data(this.dataSelector);
			var interfaceUrl = '/interface/' + tag;
			this.beforeUpdate($target);
			$.get(interfaceUrl)
				.then($.proxy(function (html) {
					$('[data-' + this.dataSelector + '="' + tag + '"]').each(function () {
						$(this).html(html);
					});
					this.afterUpdate($target);
				}, this));
		}
	};

	$.extend(true, window, { MCF: { Interface: Interface }});
})(jQuery);
