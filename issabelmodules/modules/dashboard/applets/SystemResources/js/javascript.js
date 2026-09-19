$(document).ready(function() {
    var gauges = ['cpugauge', 'memgauge', 'swapgauge'];
    for (var i = 0; i < gauges.length; i++) {
        // Applet HTML is inserted while hidden. Avoid measuring percentage/min()
        // widths before layout; scale the finished SVG with its viewBox instead.
        var gauge = new JustGage({
            id: "dashboard-applet-"+gauges[i],
            width: 140,
            height: 140,
            value: $('input#'+gauges[i]+'_value').val() * 100.0,
            min: 0,
            max: 100,
            donut: true,
            startAnimationType : 'bounce',
            shadowSize: 0,
            shadowVerticalOffset: 0,
            valueFontColor: '#666666',
            title: $('input#'+gauges[i]+'_label').val(),
            label: "%"
        });
        gauge.canvas.setViewBox(0, 0, 140, 140, true);
        $('div#dashboard-applet-'+gauges[i]).data('justgage', gauge);
    }

	if (typeof systemresources_status_timer == 'undefined')
		systemresources_status_timer = null;
	if (systemresources_status_timer != null) clearInterval(systemresources_status_timer);
	systemresources_status_timer = setInterval(function() {
		$.get('index.php', {
			menu:		getCurrentIssabelModule(),
			rawmode:	'yes',
			applet:		'SystemResources',
			action:		'updateStatus'
		}, function(respuesta) {
			if (respuesta.status != null) {
				for(var gauge in respuesta.status) {
					SystemResources_setGaugeFraction(gauge, respuesta.status[gauge]);
				}
			}
		});
	}, 5000);
});

function SystemResources_setGaugeFraction(gauge, fraction)
{
    $('div#dashboard-applet-'+gauge).data('justgage').refresh(fraction * 100.0);
}