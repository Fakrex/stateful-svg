var path = require('path'),
	fs = require('fs'),
	Q = require('q');

var iconsDir = './SVG/',
	resultFilename = 'icons.less';



function IconMixinsGen() {
	var _self = this,
		_allFiles = [];


	_self.recieveIcons = function () {
		fs.readdir(iconsDir, function (err, files) {
			_allFiles = files;
			_self.formingMixins();
		});
	};

	var commonMixins = function () {
		var res = {};

		res.fill = '.common-icon-fill(@src, @fill) {\n' +
			'\t@data-uri: data-uri("image/svg+xml;charset=UTF-8", "@{src}");\n' +
			'\t@modified-src: replace("@{data-uri}", "fill\%3D\%22\%23[\w]{3,6}\%22", escape(\'fill="@{fill}"\'), "g");\n' +
			'\tbackground-image: e(@modified-src);\n' +
		'}\n\n';

		res.resize = '.common-icon-resize(@src, @width, @height) {\n' +
			'\t@data-uri: data-uri("image/svg+xml;charset=UTF-8", "@{src}");\n' +
			'\t@modified-src: replace("@{data-uri}", "width\%3D\%22[\d]\%22", escape(\'width="@{width}"\'), "g");\n' +
			'\t@res-src: replace("@{modified-src}", "height\%3D\%22[\d]\%22", escape(\'height="@{height}"\'), "g");\n' +
			'\tbackground-image: e(@res-src);\n' +
		'}\n\n';

		res.fully = '.common-icon-fully(@src, @width, @height, @fill) {\n' +
			'\t@data-uri: data-uri("image/svg+xml;charset=UTF-8", "@{src}");\n' +
			'\t@changed-src: replace("@{data-uri}", "fill\%3D\%22\%23[\w]{3,6}\%22", escape(\'fill="@{fill}"\'), "g");\n' +
			'\t@modified-src: replace("@{changed-src}", "width\%3D\%22[\d]\%22", escape(\'width="@{width}"\'), "g");\n' +
			'\t@res-src: replace("@{modified-src}", "height\%3D\%22[\d]\%22", escape(\'height="@{height}"\'), "g");\n' +
			'\tbackground-image: e(@res-src);\n' +
		'}\n\n';

		return res;
	}

	_self.formingMixins = function () {
		var filename,
			internalMixins = commonMixins(),
			currentOriginalMixin,
			currentStatefulMixinResize,
			currentStatefulMixinFill,
			currentStatefulMixinFully;

		if (_allFiles.length > 0) {
			fs.writeFile(resultFilename, '', function(){});

			for(var state in internalMixins) {
				fs.appendFile(resultFilename, internalMixins[state], function (err) {
				 	if (err) throw err;
				});
			}

			_allFiles.forEach(function (file) {
				if(path.extname(file) === '.svg') {
					filename = file.slice(0,-4);
					filePath = iconsDir + file;

					currentOriginalMixin = '.icon-' + filename + '() { \n' +
						'\tbackground-image: data-uri("image/svg+xml;charset=UTF-8", "' + filePath + '"); \n' +
						'\tbackground-repeat: no-repeat;\n' +
					'}\n\n' ;

					currentStatefulMixinFill = '.icon-' + filename + '-fill (@color) {\n' +
						'\t.common-icon-fill("' + filePath + '", @color);\n' +
						'\tbackground-repeat: no-repeat;\n' +
					'}\n\n';

					currentStatefulMixinResize = '.icon-' + filename + '-resize (@width, @height) {\n' +
						'\t.common-icon-resize("' + filePath + '", @width, @height);\n' +
						'\tbackground-repeat: no-repeat;\n' +
					'}\n\n';

					currentStatefulMixinFully = '.icon-' + filename + '-fully(@width, @height, @color) {\n' +
						'\t.common-icon-fully("' + filePath + '", @width, @height);\n' +
						'\tbackground-repeat: no-repeat;\n' +
					'}\n\n';

				} else {
					console.log(file + 'was skipped. Inappropriate file extension!');
				}

				fs.appendFile(resultFilename, currentOriginalMixin +
				 currentStatefulMixinFill +
			 	 currentStatefulMixinResize +
		 	 	 currentStatefulMixinFully, function (err) {
				 	if (err) throw err;
				});
			});

			console.log('File is written!');
		} else {
			console.log('Files not found!');
		}

		
	};

	_self.run = function () {
		_self.recieveIcons();
	};

}


(function main() {
	var svgLib = new IconMixinsGen();
	svgLib.run();
})();