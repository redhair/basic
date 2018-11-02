'use-strict'

window.onload = () => {
	const fs = require('fs')
	const path = require('path')
	const ctx = {}

	_init()
	function _init() {
		initMain()
		initTitleBar()
		initGutter()
		initTextArea()
		initSettings()

		setTimeout(() => {
		  ctx.text.focus()
		}, 0)
	}

	function initMain() {
		let main = document.createElement('div')
		main.className = 'main'
		ctx.main = main

		document.body.appendChild(ctx.main)
	}

	function initTitleBar() {
		let titleBar = document.createElement('div')
		titleBar.style.height = '22px'
		titleBar.style.width  = '100%'
		titleBar.style['-webkit-app-region'] = 'drag';

		let settingsButton = document.createElement('button')
		//inifity: &#9854;
		//sun: &#9737;
		//circle: &#9900;
		settingsButton.innerHTML = "&#9854;"
		settingsButton.addEventListener('click', () => {
		    if (!ctx.settings.classList.contains('active')) {
		    	ctx.settings.classList.add('active')
		        ctx.settings.style.right = "0px"
		    } else {
		    	ctx.settings.style.right = "-230px"
		    	ctx.settings.addEventListener('transitionend', () => {
		        	ctx.settings.classList.remove('active')
		        }, { once: true })
		    }
		})
		titleBar.appendChild(settingsButton)

		ctx.titleBar = titleBar
		ctx.main.appendChild(titleBar)
	}

	function initGutter() {
		let gutter = document.createElement('ul')
		//replace dirname with the top level folder opened
		buildFileSystem(__dirname, (filesystem) => {
			console.log(filesystem)
			filesystem.map((item) => {
				gutter.appendChild(item)
			})

			ctx.gutter = gutter
			ctx.main.appendChild(gutter)
		})
	}

	function initTextArea() {
		let text = document.createElement('textarea')
		ctx.text = text
		ctx.main.appendChild(text)
	}


	function initSettings() {
		let settings = document.createElement('div')
		settings.className = 'settings'

		ctx.settings = settings
		initSliders()

		ctx.main.appendChild(settings)
	}

	function initSliders() {
		addSlider('letter-spacing', 0.01, 10)
		addSlider('font-size', 0.05, 20)
		addSlider('line-height', 0.05, 30)
		addSlider('word-spacing', 0.01, 10)
	}

	function addSlider(type, scale, defualtValue) {
		let slider = document.createElement('input')
		slider.type = 'range'
		slider.min = 1
		slider.max = 100
		slider.value = (defualtValue || 50)
		slider.className = 'slider'
		slider.addEventListener('input', () => {
			ctx.text.style[type] = (scale * slider.value) + 'em'
		})

		let label = document.createElement('label')
		label.innerText = type.replace('-', ' ').toUpperCase()
		label.setAttribute('for', type)

		ctx.settings.appendChild(label)
		ctx.settings.appendChild(slider)
	}

	function buildFileSystem(dir, callback) {
		if (!dir)
			dir = __dirname

		getFolderContents(dir, function lambda(folderContents) {
			let filesystem = []
			for (let i = 0; i < folderContents.length; i++) {
				filesystem.push(addListItem(folderContents[i]))
			}
			console.log(filesystem)
			callback(filesystem)
		})
	}

	function addListItem(folderContent) {
		let item = document.createElement('li')
		let isFolder = (folderContent.type === 'folder')
		if (isFolder) {
			item.appendChild(addDropdownIcon())
		} else {
			item.innerHTML += '&nbsp;&nbsp;&nbsp;'
		}
		item.name = folderContent.name
		item.type = folderContent.type
		item.innerHTML += folderContent.name
		item.addEventListener('click', () => {
			clearActiveListItem(item)
			if (isFolder) {
				let icon = item.getElementsByTagName('i')[0]
				icon.style.webkitTransform = 'rotate(90deg)';
			    icon.style.mozTransform    = 'rotate(90deg)';
			    icon.style.msTransform     = 'rotate(90deg)';
			    icon.style.oTransform      = 'rotate(90deg)';
			    icon.style.transform       = 'rotate(90deg)';
			}
			item.className += 'list-active'
			let filename = item.name
			if (item.type === 'folder') {
			//	getFolderContents(__dirname + '/' + filename, lambda)
			} else {
				openFile(filename)						
			}
		})

		return item
	}

	function addDropdownIcon() {
		let dropdown = document.createElement('i')
		dropdown.innerHTML = '&#9658;&nbsp;'

		return dropdown
	}

	function clearActiveListItem(item) {
		let children = item.parentElement.children
		for (let i = 0; i < children.length; i++) {
		  	let listItem = children[i]
		  	if (listItem.className.indexOf('list-active') > -1) {
				listItem.className = ''
			}
			if (listItem.type === 'folder') {
				resetFolderDropdownArrow(listItem)
			}
 		}
	}

	function resetFolderDropdownArrow(folder) {
		let icon = folder.getElementsByTagName('i')[0]
		icon.style.webkitTransform = 'rotate(0deg)';
	    icon.style.mozTransform    = 'rotate(0deg)';
	    icon.style.msTransform     = 'rotate(0deg)';
	    icon.style.oTransform      = 'rotate(0deg)';
	    icon.style.transform       = 'rotate(0deg)';
	}

	function getFolderContents(dir, callback) {
		let contents = []
		fs.readdir(dir, (err, files) => {
			if (err) throw err
  			files.map((fileRelative) => {
  				return {
  					absolute: path.join(dir, fileRelative),
  					relative: fileRelative
  				}
			}).filter((fileObject) => {
				let isFolder = fs.lstatSync(fileObject.absolute).isDirectory()
				let type
				if (isFolder) {
					type = 'folder'
				} else {
					type = 'file'
				}
				contents.push({
					name: fileObject.relative,
					type: type
				})
			})

			// before returning, sort the contents by:
			// (folder > file) > (a > b > c)
			contents = contents.sort((a, b) => {
				if (a.type === 'folder' 
				&&  b.type === 'folder') {
					if (a.name > b.name) {
						return 1
					} else {
						return -1
					}
					return 0
				}
				return b.type === 'folder'
			})

			callback(contents)
		})
	}

	function openFile(filename) {
		name = sanitize(filename)
		fs.readFile(name, 'utf-8', (err, data) => {
			if (err) throw err
			ctx.text.value = data
		})
	}

	function sanitize(input) {
		var illegalRe = /[\/\?<>\\:\*\|":]/g;
		var controlRe = /[\x00-\x1f\x80-\x9f]/g;
		var reservedRe = /^\.+$/;
		var windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
	  	var sanitized = input
		    .replace(illegalRe, '')
		    .replace(controlRe, '')
		    .replace(reservedRe, '')
		    .replace(windowsReservedRe, '')
		    .trim()

	  	return truncate(sanitized, 255)
	}

	function truncate(string, maxLength) {
		if (string.length > maxLength) {
			return string.substring(0, maxLength-1)
		}
		return string
	}
}