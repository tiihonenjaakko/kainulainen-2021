/**!
 * MyCashflow theme plugin; Free shipping progress bar
 * Copyright (c) 2018 Pulse247 Oy
 * MIT License <http://opensource.org/licenses/MIT>
 *
 * @version 1.1.0
 */
 ;(function ($) {
	'use strict';

	var Plugin = {

		targetTotal: '0.00',
		currentTotal: '0.00',
		progressBar: '',
		progressAmount: '',
		animateOnLoad: false,
		animationSpeed: 500,

		_decimalsep: null,
		_targetTotal: 0.00,
		_total: 0.00,

		init: function (config) {
			$.extend(true, this, config);
			this.setTargetTotal(this.targetTotal || 0.00);
			this.setCartTotal(this.currentTotal || 0.00);
			this._calculate(this.animateOnLoad || false);
		},

		_parseDecimalSeparator: function (str) {
			var regex = /(\,|\.)[0-9]{2}$/;
			var separator = regex.exec(str.toString())[1] || '.';
			return separator;
		},

		_parsePrice: function (str) {
			str = $('<span>' + str + '</span>').text();
			var decimalsep = this._parseDecimalSeparator(str);
			var decimalReplaceRegex = new RegExp('/(\\' + decimalsep + ')[0-9]{2}$/');
			str = str.replace(decimalReplaceRegex, '.');
			return parseFloat(str);
		},

		_formatPrice: function (amount) {
			return parseFloat(amount).toFixed(2).toString()
				.replace('.', this._decimalsep);
		},

		update: function () {
			$.get('/interface/CartSubTotal?html=false&currencysymbol=false&decimals=2')
				.done($.proxy(this._ajaxSuccess, this));
		},

		_ajaxSuccess: function (total) {
			this.setCartTotal(total);
			this.refresh(true);
		},

		setTargetTotal: function (total) {
			this._targetTotal = this._parsePrice(total);
		},

		setCartTotal: function (total) {
			this._decimalsep = this._parseDecimalSeparator(total);
			this._total = this._parsePrice(total);
		},

		refresh: function (animate) {
			this._calculate(animate);
		},

		_calculate: function (animate) {
			var percentage = this._total / this._targetTotal;
			var difference = this._targetTotal - this._total;

			percentage = Math.round(percentage * 100);
			if (percentage > 100) percentage = 100;
			if (difference < 0) difference = 0.00;

			var $progressBar = $(document).find(this.progressBar);
			var $amount = $(document).find(this.progressAmount);

			$(document).trigger('calculated.mcf.free-shipping-progress', [
				percentage,
				difference
			]);

			$(document).trigger('progress:' +
				(percentage === 100 ? 'complete' : 'uncomplete') +
				'.mcf.free-shipping-progress');

			if (!!$amount.length) {
				$amount.text(this._formatPrice(difference));
			}

			if (!!$progressBar.length) {
				if (!!animate) {
					$progressBar.animate({
						'width': percentage + '%'
					}, this.animationSpeed);
				} else {
					$progressBar.css({
						'width': percentage + '%'
					});
				}
			}
		}
	};

	$.extend(true, window, { MCF: { FreeShippingProgress: Plugin }});
})(jQuery);
