function getURLVar(key) {
	var value = [];

	var query = String(document.location).split('?');

	if (query[1]) {
		var part = query[1].split('&');

		for (let i = 0; i < part.length; i++) {
			var data = part[i].split('=');

			if (data[0] && data[1]) {
				value[data[0]] = data[1];
			}
		}

		if (value[key]) {
			return value[key];
		} else {
			return '';
		}
	}
}

$(document).ready(function () {
	//Form Submit for IE Browser
	$('button[type=\'submit\']').on('click', function () {
		$("form[id*='form-']").submit();
	});

	// Highlight any found errors
	$('.text-danger').each(function () {
		var element = $(this).parent().parent();

		if (element.hasClass('form-group')) {
			element.addClass('has-error');
		}
	});

	// tooltips on hover
	$('[data-toggle=\'tooltip\']').tooltip({ container: 'body', html: true });

	// Makes tooltips work on ajax generated content
	$(document).ajaxStop(function () {
		$('[data-toggle=\'tooltip\']').tooltip({ container: 'body' });
	});

	// https://github.com/opencart/opencart/issues/2595
	$.event.special.remove = {
		remove: function (o) {
			if (o.handler) {
				o.handler.apply(this, arguments);
			}
		}
	}

	// tooltip remove
	$('[data-toggle=\'tooltip\']').on('remove', function () {
		$(this).tooltip('destroy');
	});

	// Tooltip remove fixed
	$(document).on('click', '[data-toggle=\'tooltip\']', function (e) {
		$('body > .tooltip').remove();
	});

	$('#button-menu').on('click', function (e) {
		e.preventDefault();

		$('#column-left').toggleClass('active');
	});

	// Set last page opened on the menu
	$('#menu a[href]').on('click', function () {
		sessionStorage.setItem('menu', $(this).attr('href'));
	});

	if (!sessionStorage.getItem('menu')) {
		$('#menu #menu-dashboard').addClass('menu-item-active');
	} else {
		// Sets active and open to selected page in the left column menu.
		$('#menu a[href=\'' + sessionStorage.getItem('menu') + '\']').parent().addClass('menu-item-active');
	}

/* 	$('#menu a[href=\'' + sessionStorage.getItem('menu') + '\']').parents('li > a').removeClass('menu-item-open');

	$('#menu a[href=\'' + sessionStorage.getItem('menu') + '\']').parents('ul').addClass('in'); */

	$('#menu a[href=\'' + sessionStorage.getItem('menu') + '\']').parents('li').addClass('menu-item-open');

	// Image Manager
	$(document).on('click', 'a[data-toggle=\'image\']', function (e) {
		var $element = $(this);
		var $toolbar_old = $("#img-toolbar-");

		e.preventDefault();

		// remove flickering (do not re-add popover when clicking for removal)
		if ($toolbar_old !== undefined) {
			$toolbar_old.remove();
		}

		let toolbar = document.createElement("div");
		toolbar.id = "img-toolbar-";
		toolbar.classList.add("img-toolbar");
		let $toolbar = $(toolbar);

		$toolbar.html(`<button type="button" id="button-image" class="btn btn-icon btn-sm btn-primary">
		<span class="fas fa-pen"></span></button>
		<button type="button" id="button-clear" class="btn btn-icon btn-sm btn-danger">
		<span class="fas fa-trash"></span></button>`)

		$element.parent().append($toolbar);

		$('#button-image').on('click', function () {
			var $button = $(this);
			var $icon = $button.find('> i');

			$('#modal-image').remove();

			$.ajax({
				url: 'index.php?route=common/filemanager&user_token=' + getURLVar('user_token') + '&target=' + $element.parent().find('input').attr('id') + '&thumb=' + $element.attr('id'),
				dataType: 'html',
				beforeSend: function () {
					$button.prop('disabled', true);
					if ($icon.length) {
						$icon.attr('class', 'fa fa-circle-o-notch fa-spin');
					}
				},
				complete: function () {
					$button.prop('disabled', false);

					if ($icon.length) {
						$icon.attr('class', 'fa fa-pencil');
					}
				},
				success: function (html) {
					$('body').append('<div id="modal-image" class="modal">' + html + '</div>');

					$('#modal-image').modal('show');
				}
			});

			$toolbar.remove();
		});

		$('#button-clear').on('click', function () {
			$element.find('img').attr('src', $element.find('img').attr('data-placeholder'));

			$element.parent().find('input').val('');

			$toolbar.remove();
		});
	});
});

// Autocomplete */
(function ($) {
	$.fn.autocomplete = function (option) {
		return this.each(function () {
			var $this = $(this);
			var $dropdown = $('<ul class="dropdown-menu" />');

			this.timer = null;
			this.items = [];

			$.extend(this, option);

			$this.attr('autocomplete', 'off');

			// Focus
			$this.on('focus', function () {
				this.request();
			});

			// Blur
			$this.on('blur', function () {
				setTimeout(function (object) {
					object.hide();
				}, 200, this);
			});

			// Keydown
			$this.on('keydown', function (event) {
				switch (event.keyCode) {
					case 27: // escape
						this.hide();
						break;
					default:
						this.request();
						break;
				}
			});

			// Click
			this.click = function (event) {
				event.preventDefault();

				var value = $(event.target).parent().attr('data-value');

				if (value && this.items[value]) {
					this.select(this.items[value]);
				}
			}

			// Show
			this.show = function () {
				var pos = $this.position();

				$dropdown.css({
					top: pos.top + $this.outerHeight(),
					left: pos.left
				});

				$dropdown.show();
			}

			// Hide
			this.hide = function () {
				$dropdown.hide();
			}

			// Request
			this.request = function () {
				clearTimeout(this.timer);

				this.timer = setTimeout(function (object) {
					object.source($(object).val(), $.proxy(object.response, object));
				}, 200, this);
			}

			// Response
			this.response = function (json) {
				var html = '';
				var category = {};
				var name;
				var i = 0, j = 0;

				if (json.length) {
					for (i = 0; i < json.length; i++) {
						// update element items
						this.items[json[i]['value']] = json[i];

						if (!json[i]['category']) {
							// ungrouped items
							html += '<li data-value="' + json[i]['value'] + '"><a href="#">' + json[i]['label'] + '</a></li>';
						} else {
							// grouped items
							name = json[i]['category'];
							if (!category[name]) {
								category[name] = [];
							}

							category[name].push(json[i]);
						}
					}

					for (name in category) {
						html += '<li class="dropdown-header">' + name + '</li>';

						for (j = 0; j < category[name].length; j++) {
							html += '<li data-value="' + category[name][j]['value'] + '"><a href="#">&nbsp;&nbsp;&nbsp;' + category[name][j]['label'] + '</a></li>';
						}
					}
				}

				if (html) {
					this.show();
				} else {
					this.hide();
				}

				$dropdown.html(html);
			}

			$dropdown.on('click', '> li > a', $.proxy(this.click, this));
			$this.after($dropdown);
		});
	}
})(window.jQuery);
