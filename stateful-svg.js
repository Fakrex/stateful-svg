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
			'\t@modified-src: replace("@{src}", "fill\%3D\%22\%23[\\w]{3,6}\%22", escape(\'fill="@{fill}"\'), "g");\n' +
			'\tbackground: e(@modified-src);\n' +
		'}\n\n';

		res.resize = '.common-icon-resize(@src, @width, @height) {\n' +
			'\t@modified-src: replace("@{src}", "width\%3D\%22[\\d]\%22", escape(\'width="@{width}"\'), "g");\n' +
			'\t@res-src: replace("@{modified-src}", "height\%3D\%22[\\d]\%22", escape(\'height="@{height}"\'), "g");\n' +
			'\tbackground: e(@res-src);\n' +
		'}\n\n';

		res.fully = '.common-icon-fully(@src, @width, @height, @fill) {\n' +
			'\t@changed-src: replace("@{src}", "fill\%3D\%22\%23[\\w]{3,6}\%22", escape(\'fill="@{fill}"\'), "g");\n' +
			'\t@modified-src: replace("@{changed-src}", "width\%3D\%22[\\d]\%22", escape(\'width="@{width}"\'), "g");\n' +
			'\t@res-src: replace("@{modified-src}", "height\%3D\%22[\\d]\%22", escape(\'height="@{height}"\'), "g");\n' +
			'\tbackground: e(@res-src);\n' +
		'}\n\n';

		return res;
	}

	_self.formingMixins = function () {
		var filename,
			internalMixins = commonMixins(),
			srcOrigin,
			currentOriginalMixin,
			currentStatefulMixinResize,
			currentStatefulMixinFill,
			currentStatefulMixinFully;

		if (_allFiles.length > 0) {
			fs.writeFileSync(resultFilename, '');

			for(var state in internalMixins) {
				fs.appendFileSync(resultFilename, internalMixins[state]);
			}

			_allFiles.forEach(function (file) {
				if(path.extname(file) === '.svg') {
					filename = file.slice(0,-4);
					filePath = iconsDir + file;

					srcOrigin = '@src-' + filename + ': \'url("data:image/svg+xml;charset=UTF-8,';

					srcOrigin += encodeURIComponent(fs.readFileSync(filePath)) + '")\';\n';

					currentOriginalMixin = '.icon-' + filename + '() { \n' +
						'\tbackground: e(@src-' + filename + '); \n' +
						'\tbackground-repeat: no-repeat;\n' +
					'}\n\n' ;

					currentStatefulMixinFill = '.icon-' + filename + '-fill (@color) {\n' +
						'\t.common-icon-fill("@{src-' + filename + '}", "@{color}");\n' +
						'\tbackground-repeat: no-repeat;\n' +
					'}\n\n';

					currentStatefulMixinResize = '.icon-' + filename + '-resize (@width, @height) {\n' +
						'\t.common-icon-resize("@{src-' + filename + '}", "@{width}", "@{height}");\n' +
						'\tbackground-repeat: no-repeat;\n' +
					'}\n\n';

					currentStatefulMixinFully = '.icon-' + filename + '-fully(@width, @height, @color) {\n' +
						'\t.common-icon-fully("{@src-' + filename + '}", "@{width}", "@{height}", "@{color}");\n' +
						'\tbackground-repeat: no-repeat;\n' +
					'}\n\n';

				} else {
					console.log(file + 'was skipped. Inappropriate file extension!');
				}

				fs.appendFileSync(resultFilename, srcOrigin + currentOriginalMixin +
				 currentStatefulMixinFill +
			 	 currentStatefulMixinResize +
		 	 	 currentStatefulMixinFully);
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