//define hotkeys in this file, then include it in index.js

(function(d){
	function getSel() {
	    var txtarea = document.getElementById("mytextarea")
	    var start = txtarea.selectionStart
	    var finish = txtarea.selectionEnd
	    var sel = txtarea.value.substring(start, finish)
	}
})(document)