{*
  Voiz: applet grid - markup restructured with the internal utility
  engine (voiz-tw) so the dashboard is a fluid responsive grid.
  Portlet ids/classes are preserved 1:1 - dashboard js keeps working.
*}
<div id="applet_grid" class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-4 tw-w-full">
    <div class="appletcolumn" id="applet_col_1">
        {foreach from=$applet_col_1 item=applet}
        <div class='appletwindow voiz-tw voiz-card-hover tw-min-w-0' id='portlet-{$applet.code}'>
            <div class='appletwindow_topbar voiz-flex voiz-items-center voiz-flex--sb voiz-gap-2'>
                <div class='appletwindow_title voiz-text-md voiz-font-semibold voiz-flex voiz-items-center voiz-gap-2'>{$applet.name}</div>
                <div class='appletwindow_widgets voiz-flex voiz-items-center voiz-gap-2'>
                    <button type="button" class="appletrefresh" aria-label="{$applet.name|escape:html} — {$LABEL_LOADING|escape:html}">
                        <i class="fa fa-refresh"></i>
                    </button>
                </div>
            </div>
            <div class='appletwindow_content' id='{$applet.code}'>
                <div class='appletwindow_wait voiz-text-muted voiz-flex voiz-items-center voiz-gap-2'><i class="fa fa-spinner fa-pulse"></i>&nbsp;{$LABEL_LOADING}</div>
                <div class='appletwindow_fullcontent'></div>
            </div>
        </div>
        {/foreach}
    </div>
    <div class="appletcolumn" id="applet_col_2">
        {foreach from=$applet_col_2 item=applet}
        <div class='appletwindow voiz-tw voiz-card-hover tw-min-w-0' id='portlet-{$applet.code}'>
            <div class='appletwindow_topbar voiz-flex voiz-items-center voiz-flex--sb voiz-gap-2'>
                <div class='appletwindow_title voiz-text-md voiz-font-semibold voiz-flex voiz-items-center voiz-gap-2'>{$applet.name}</div>
                <div class='appletwindow_widgets voiz-flex voiz-items-center voiz-gap-2'>
                    <button type="button" class="appletrefresh" aria-label="{$applet.name|escape:html} — {$LABEL_LOADING|escape:html}">
                        <i class="fa fa-refresh"></i>
                    </button>
                </div>
            </div>
            <div class='appletwindow_content' id='{$applet.code}'>
                <div class='appletwindow_wait voiz-text-muted voiz-flex voiz-items-center voiz-gap-2'><i class="fa fa-spinner fa-pulse"></i>&nbsp;{$LABEL_LOADING}</div>
                <div class='appletwindow_fullcontent'></div>
            </div>
        </div>
        {/foreach}
    </div>
</div>
