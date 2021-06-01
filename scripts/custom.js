/**
 * MyCashflow Default Theme
 * Copyright (c) 2015 Pulse247 Oy
 * MIT License <http://opensource.org/licenses/MIT>
 */
$(document).ready(function () {
	'use strict';

	$.ajaxSetup({
		cache: false
	});

	$.Finger = {
		flickDuration: 150,
		motionThreshold: 5
	};

	$.each([
		'Drawers',
		'Filters',
		'Loaders',
		'Navigations',
		'Notifications',
		'Spinners',
		'Tabs'
	], function (index, name) {
		var plugin = MCF[name];
		if (plugin) {
			plugin.init();
		}
	});

	new MCF.Search({
		$searchForm: $('#LiveSearch'),

		beforeUpdate: function ($elem) {
			MCF.Loaders.show($elem);
		},

		afterUpdate: function ($elem) {
			MCF.Loaders.hide($elem);
		}
	});

	MCF.Theme.init({
		updateCarts: function () {
			return $.when([
				this.updateFullCart(),
				this.updateMiniCarts()
			]);
		},

		updateFullCart: function () {
			var $fullCart = $('.FullCart').first();
			if (!$fullCart.length) {
				return;
			}
			var $products = $fullCart.find('.Product');
			if ($products.length) {
				MCF.Loaders.show($fullCart);
			} else {
				$fullCart.remove();
				return;
			}
			return $.get('/interface/Helper?file=helpers/full-cart')
				.then(function (html) {
					$fullCart.html(html);
					MCF.Spinners.wrapInputs($fullCart);
					MCF.Loaders.hide($fullCart);
				});
		},

		updateMiniCarts: function () {
			var $miniCarts = $('.MiniCart');
			if (!$miniCarts.length) {
				return;
			}
			$miniCarts.each(function () {
				var $cart = $(this);
				var $drawer = $cart.closest('.Drawer');
				if ($cart.is(':visible') && !$drawer.length) {
					MCF.Loaders.show($cart);
				}
			});
			MCF.Interface.get($('[data-interface="CartTotal"]'));
			return $.get('/interface/Helper?file=helpers/mini-cart')
				.then(function (html) {
					$miniCarts.each(function () {
						var $cart = $(this);
						$cart.children(':not(.Loader)').remove();
						$cart.append(html);
						MCF.Loaders.hide($cart);
            MCF.FreeShippingProgress.update();
					});
				});
		},

		skipNotifications: function (ajaxSettings) {
			// Skip spam when filling checkout address information.
			var $focused = $('#CheckoutBillingAddress, #CheckoutShippingAddress').find(':focus');
			if (ajaxSettings.url === '/checkout/' && $focused.length) {
				return true;
			}
		}
	});

	MCF.Cart.init({
		beforeUpdate: function ($cart) {
			MCF.Loaders.show($cart);
		},

		afterUpdate: function ($cart) {
			MCF.Loaders.hide($cart);
			MCF.Theme.updateCarts();
		},

		beforeAddProduct: function ($buyForm) {
			MCF.Loaders.show($buyForm);
		},

		afterAddProduct: function ($buyForm) {
			MCF.Loaders.hide($buyForm);
			MCF.Theme.updateMiniCarts()
				.then(function () {
					MCF.Drawers.toggleByName('cart');
				});
		},

		beforeRemoveProduct: function ($removeLink) {
			var $product = $removeLink.closest('.Product');
			$product.fadeOut('fast');
		},

		afterRemoveProduct: function () {
			MCF.Theme.updateCarts();
		}
	});

	MCF.Checkout.init({
		afterUpdate: function () {
			MCF.Theme.updateMiniCarts();
		},

		beforeUpdatePart: function ($part) {
			MCF.Loaders.show($part);
		},

		afterUpdatePart: function ($part) {
			MCF.SelectedMethod.onUpdate();
			MCF.Loaders.hide($part);
		}
	});

	MCF.KlarnaCheckout.init({
		beforeUpdate: function ($element) {
			MCF.Loaders.show($element);
		},

		afterUpdate: function ($element) {
			MCF.Loaders.hide($element);
			MCF.Theme.updateMiniCarts();

			if ($element.is('#CheckoutSubmitOrderComment')) {
				MCF.Notifications.success(MCF.Locales.get('orderCommentSaved'));
			}
		}
	});

	MCF.Modals.init({
		closeBtnInside: true,
		tClose: MCF.Locales.get('close'),
		tLoading: MCF.Locales.get('loading'),
		gallery: {
			tPrev: MCF.Locales.get('previous'),
			tNext: MCF.Locales.get('next')
		}
	});

	MCF.Images.init({
		zoomMode: 'off',
		hint: false,
		transitionEffect: false,
		textClickZoomHint: MCF.Locales.get('expandImage'),
		textHoverZoomHint: MCF.Locales.get('expandImage'),
		textExpandHint: MCF.Locales.get('expandImage'),
		textBtnClose: MCF.Locales.get('close'),
		textBtnPrev: MCF.Locales.get('previous'),
		textBtnNext: MCF.Locales.get('next')
	});

	MCF.Interface.init({
		afterUpdate: function ($target) {
			if ($target.is('[data-interface="CartTotal"]')) {
				console.log('oujea');
				var $total = $target.html();
			$('.CartTotalVisual').attr('data-cart-total', $total);
			}
		}
	});

	MCF.SelectedMethod.init({
		selectedClass: 'SelectedMethod'
	});

	MCF.Sliders.init({
		'default': {
			contain: true,
			cellAlign: 'left'
		},
		'banner': {
			adaptiveHeight: false,
			groupCells: '100%',
			autoPlay: false,
			pageDots: false
		},
		'banner-wide': {
			bgLazyLoad: true,
			autoPlay: false,
			pageDots: true,
			prevNextButtons: false,
			wrapAround: true,
			adaptiveHeight: true
		},
		'grid-list': {
			groupCells: '100%',
			pageDots: false,
			watchCSS: true
		}
	});

	MCF.Variations.init({
		selectText: MCF.Locales.get('choose')
	});

	//--------------------------------------------------------------------------
	// Buy Form Variations
	//--------------------------------------------------------------------------

	function radioWraps() {
		var $variations = $('.BuyFormVariationRadio');
		var selectedClass = 'Selected';
		var disabledClass = 'Disabled';
		var wrapperClass = 'RadioItem';

		$variations.each(function() {
			var label = $(this).find('.Checks > label');
			var button = $(this).parent().find('[type="submit"]');

			label.each(function() {
				$(this).next('p').addBack().wrapAll('<div class="RadioItem"/>');
			});

			$variations.find('label > input:checked').closest('.RadioItem').addClass('Selected');
			$variations.find('label > input:disabled').closest('.RadioItem').addClass('Disabled');

			label.click(function() {
				if ( $(this).closest('.RadioItem').hasClass("Disabled") ) {
					return
				} else {
					$(this).closest($variations).find('.RadioItem').removeClass('Selected');
					$(this).closest('.RadioItem').addClass('Selected');
					$(this).children('input').attr('checked', true);
				}
			});
		});
	}
	radioWraps();

	//--------------------------------------------------------------------------
	// Accordion Titles
	//--------------------------------------------------------------------------

	function accordionTitles() {
		var toggleSelector = '.ProductFullDesc > h3';
		var toggleTitle = $(toggleSelector);

		toggleTitle.each(function() {
			$(this).nextUntil(toggleSelector + ', h1, h2').wrapAll('<div class="AccordionWrap"></div>');
		});

		$(document).on('click', toggleSelector, function () {
			$(this).toggleClass('Active');
			$('#StickySidebar').hcSticky('refresh');
		});
	}
	accordionTitles();

	//----------------------------------------------------------------------------
	// Accordion Titles
	//----------------------------------------------------------------------------

	function accordionTitlesFilters() {
		var toggleSelector = '.FiltersList h4';
		var toggleTitle = $(toggleSelector);

		toggleTitle.each(function() {
			$(this).nextUntil(toggleSelector + ', h1, h2').wrapAll('<div class="desc-wrap"></div>');
		});
		toggleTitle.click(function() {
			$(this).toggleClass('active').next().slideToggle('fast').toggleClass('active');
		});
	}
	accordionTitlesFilters();

	//--------------------------------------------------------------------------
	// Submit Modal AvailabilityNotification Form via AJAX
	//--------------------------------------------------------------------------

	$(document).on('submit', '.mfp-ajax-content .AvailabilityNotificationForm', function (evt) {
		evt.preventDefault();
		var $form = $(this);
		var $url = $form.closest('[data-product-url]').attr('data-product-url');

		$.ajax({
			type: "POST",
			url: $url,
			data: $form.serialize(),
			beforeSend: function() {
				MCF.Loaders.show($form);
			},
			success: function(data) {
				MCF.Loaders.hide($form);
				$.magnificPopup.close();
			},
			error: function() {
				MCF.Loaders.hide($form);
				$.magnificPopup.close();
			}
		});
	});

	$(document).on('click', '[href="/terms/"]', function () {
		MCF.Drawers.toggleByName('terms');
		return false;
	});

	$(document).on('click', '.Drawer .GiftCardDetails', function () {
		MCF.Drawers.toggleByName('gift-cards');
		return false;
	});

	$(document).on('change', '[data-auto-submit]', function (evt) {
		$(evt.currentTarget).closest('form').submit();
	});

	$(document).on('ajaxSuccess', function (evt, xhr, settings) {
		if (MCF.Theme.skipNotifications(settings)) {
			return;
		}
		var json;
		try {
			json = $.parseJSON(xhr.responseText);
		} catch (e) {
			MCF.Notifications.createFromHtml(xhr.responseText);
		}
		if (json && json.notifications) {
			MCF.Notifications.createFromJson(json);
		}
	});

	$('#StickyNavigation').hcSticky({
		stickTo: '.SiteWrapper'
	});

	var $navBarHeight = $('#StickyNavigation').outerHeight() + 20;

  $('#StickySideNavigation').hcSticky({
		stickTo: '.SiteColumns',
    top: $navBarHeight
	});

	if ($('#StickyCart .MiniCartProducts').children().length < 5) {
		$('#StickyCart').hcSticky({
			stickTo: '.Grid',
			top: $navBarHeight
		});
	}

  //--------------------------------------------------------------------------
	// Sort Product Options List
	//--------------------------------------------------------------------------

	function sortOptions(list) {
		list.children()
			.sort(function (a, b) {
				return $(a).find('.ProductName').text().toUpperCase().localeCompare($(b).find('.ProductName').text().toUpperCase())
			})
			.appendTo(list);
			list.addClass('ListSorted');
			optionsShortNames(list);
	}

	function optionsShortNames(list) {
		list.children().each(function () {
		var $productName = $(this).find('.ProductName').text();
		var regex = /(?:[^,]*)(?:,?\s*)?(.*)/g;
		var name = $productName;
		var parts = regex.exec(name);
		var variation_name = parts[1] || null;
		if (variation_name !== null) {
				$(this).find('.ProductName').html(variation_name);
			}
		});
	};

	var $sortList = $('.ProductOptionsList');
	sortOptions($sortList);

	//--------------------------------------------------------------------------
	// ReCaptcha Toggle
	//--------------------------------------------------------------------------

	$('#SubscribeEmail').focus(function () {
		var form = $(this).closest('form');
		form.addClass('Focused');
	});

	$('#SubscribeEmail').blur(function () {
		var form = $(this).closest('form');
		form.removeClass('Focused');
	});

	//--------------------------------------------------------------------------
	// Random scripts
	//--------------------------------------------------------------------------

  $('#NewsletterSubscribeForm #SubscribeEmail').each(function() {
    $(this).attr('placeholder', 'Sähköpostiosoite');
  });
  $('#NewsletterSubscribeForm button').each(function() {
    $(this).text('Liity nyt');
  });

	$('.ProductAsideColumn .BuyForm .BuyFormQuantity, .ProductAsideColumn .BuyForm .FormSubmit').wrapAll('<div class="BuyFormChild"></div>');

  //------------------------------------------------------------------------------
  // Add Active class based on url
  //------------------------------------------------------------------------------

  $(function(){
    var current = location.pathname;
    $('.MainNavigation ul li .CategoryNav:not(.Home) ul li a').each(function(){
      var $this = $(this);
      // if the current path is like this link, make it active
      if($this.attr('href').indexOf(current) !== -1){
        $this.parent().addClass('Current');
        $('.MainNavigation ul li .CategoryLink span').addClass('Current');
      }
    })
  });

  $(function(){
    var current = location.pathname;
    $('.InfoNav:not(.Home) ul li a').each(function(){
      var $this = $(this);
      // if the current path is like this link, make it active
      if($this.attr('href').indexOf(current) !== -1){
        $this.children().addClass('Current');
      }
    })
  });

  //--------------------------------------------------------------------------
	// Free Shipping Progress Bar
	//--------------------------------------------------------------------------

	MCF.FreeShippingProgress.init({
		currentTotal: MCF.Locales.get('currentCartTotal'),
		targetTotal: MCF.Locales.get('targetCartTotal'),
		progressAmount: '.ProgressCounterCurrentSum',
		progressBar: '.ProgressVisualMask',
	});

	var FreeShippingCounter = '.FreeProgressCounter';

	MCF.FreeShippingProgress.update();

	$(document).on('calculated.mcf.free-shipping-progress', function (evt, percentage, amount) {
		$(FreeShippingCounter).each(function() {
			$(this).removeClass('HideCounter');
		});
	});

	$(document).on('progress:complete.mcf.free-shipping-progress', function () {
		$(FreeShippingCounter).each(function() {
			$(this).addClass('JS-FreeShippingActivated');
		});
	});

	$(document).on('progress:uncomplete.mcf.free-shipping-progress', function () {
		$(FreeShippingCounter).each(function() {
			$(this).removeClass('JS-FreeShippingActivated');
		});
	});

	//--------------------------------------------------------------------------
	// ContactForm Modal
	//--------------------------------------------------------------------------

	var modal = document.getElementById('ContactFormModal');
	var btn = document.getElementById("AskInformationButton");
	var span = document.getElementsByClassName("close")[0];

	btn.onclick = function() {
	    modal.style.display = "block";
	}

	span.onclick = function() {
	    modal.style.display = "none";
	}

	window.onclick = function(event) {
	    if (event.target == modal) {
	        modal.style.display = "none";
	    }
	}

	$("#ContactName").prop('required',true);
	$("#ContactEmail").prop('required',true);
	$("#ContactMessage").prop('required',true);

});
