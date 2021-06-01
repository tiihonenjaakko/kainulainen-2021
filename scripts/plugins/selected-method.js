/**
 * MyCashflow Default Theme
 * Copyright (c) 2019 Pulse247 Oy
 * MIT License <http://opensource.org/licenses/MIT>
 */
;(function ($) {
	'use strict';
	
	var SelectedMethod = {
		selectedClass: 'SelectedMethod',
		formSelector: '#CheckoutForm, #CheckoutPaymentMethods',

		init: function (config) {
			$.extend(true, this, config);
			this.$form = $(this.formSelector);
			this.bindEvents();
			this.onUpdate();
		},

		bindEvents: function () {
			this.$form.on('click', '.PaymentMethod, .ShippingMethod', $.proxy(this.onClick, this));
		},

		onClick: function (evt) {
			var method = $(evt.currentTarget);
			var selectedClass = this.selectedClass;
			var input = method.find('[type="radio"]');
			if (!input.is('[disabled]')) {
				method.each(function() {
					$(this)
						.closest('[class*="MethodWrapper"]')
						.addClass(selectedClass)
						.siblings()
						.removeClass(selectedClass);
				});
			}
		},
 
		onUpdate: function () {
			var selectedClass = this.selectedClass;
			$('[type="radio"]:checked:not([disabled])', this.$form).each(function() {
				$(this)
					.closest('[class*="MethodWrapper"]')
					.addClass(selectedClass)
					.siblings()
					.removeClass(selectedClass);
			});
		}
	};
	
	$.extend(true, window, { MCF: { SelectedMethod: SelectedMethod }});
})(jQuery);
