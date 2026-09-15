<?php
global $amp_conf;
$html = '';
$version	 = get_framework_version();
$version_tag = '?load_version=' . urlencode($version);
if ($amp_conf['FORCE_JS_CSS_IMG_DOWNLOAD']) {
  $this_time_append	= '.' . time();
  $version_tag 		.= $this_time_append;
} else {
	$this_time_append = '';
}


// Brandable logos in footer
//ipbx logo

$html .= '<a target="_blank" href="' 
		. $amp_conf['BRAND_IMAGE_ISSABELPBX_LINK_FOOT']
		. '" class ="footer-float-left">'
 	 	. '<img id="footer_logo1" src="'.$amp_conf['BRAND_IMAGE_ISSABELPBX_FOOT'].$version_tag
		. '" alt="'.$amp_conf['BRAND_ISSABELPBX_ALT_FOOT'] .'"/></a>';

//text

$html .= '<span class="footer-float-left" id="footer_text">';
$html .= '<a href="http://www.voipiran.io" target="_blank" rel="noopener">CustomPBX | VOIPIRAN</a> + <a href="https://akzwp.com" target="_blank" rel="noopener">AKZ</a> ' . br();
$html .= __('CustomPBX') . ' ' . $version . ' ' . __('is licensed under the')
		. '<a href="http://www.gnu.org/copyleft/gpl.html" target="_blank"> GPL</a>' . br();
$html .= 'UI design &copy; ' . date('Y', time()) . ' <a href="https://akzwp.com" target="_blank" rel="noopener">AKZ | akzwp.com</a> | <a href="https://akzwp.ir" target="_blank" rel="noopener">akzwp.ir</a>';




//module license
if (!empty($active_modules[$module_name]['license'])) {
  $html .= br() . sprintf(__('Current module licensed under %s'),
  trim($active_modules[$module_name]['license']));
}

//benchmarking
if (isset($amp_conf['DEVEL']) && $amp_conf['DEVEL']) {
	$benchmark_time = number_format(microtime_float() - $benchmark_starttime, 4);
	$html .= '<br><span id="benchmark_time">Page loaded in ' . $benchmark_time . 's</span>';
}
$html .= '</span>';
/*
$html .= '<a target="_blank" href="' . $amp_conf['BRAND_IMAGE_SPONSOR_LINK_FOOT'] 
		. '" class="footer-float-left">'
		. '<img id="footer_logo" src="' . $amp_conf['BRAND_IMAGE_SPONSOR_FOOT'] . '" '
		. 'alt="' . $amp_conf['BRAND_SPONSOR_ALT_FOOT'] . '"/></a>';
*/
echo $html;
?>
<link rel="stylesheet" href="/themes/vitenant/css/voiz-tailwind.css?v=7.0.0">
<script>
(function () {
    var theme = 'dark';
    try { theme = localStorage.getItem('voiz-theme') === 'light' ? 'light' : 'dark'; } catch (e) {}
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.add('voiz-embedded');
    window.addEventListener('storage', function (e) {
        if (e.key === 'voiz-theme') document.documentElement.setAttribute('data-theme', e.newValue === 'light' ? 'light' : 'dark');
    });
})();
</script>
