<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="rtl" lang="fa">  <!--  Voiz -->
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="VOIZ - VOIPIRAN + AKZ | akzwp.com | akzwp.ir" />
        <title>VOIZ | VOIPIRAN + AKZ | akzwp.ir</title>
    <!-- Voiz: pre-paint theme init (avoids flash of wrong theme) -->
    <script type='text/javascript'>
        (function () {
            var t = null;
            try { t = localStorage.getItem('voiz-theme'); } catch (e) { }
            if (t !== 'dark' && t !== 'light') { t = 'dark'; }
            document.documentElement.setAttribute('data-theme', t);
        })();
    </script>

    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/bootstrap-rtl.min.css">     <!--  Voiz -->
    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/neon-core-rtl.css">  <!--  Voiz -->
     
    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/neon-theme-rtl.css"> <!--  Voiz -->
    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/neon-forms-rtl.css"> <!--  Voiz -->
    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/font-awesome-animation.min.css">
    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/custom.css">
    <!-- voipiran msm <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/rtl.css"> -->  <!--  Voiz -->
    

    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/styles.css" />
    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/widgets.css" />
    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/help.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="{$WEBPATH}themes/{$THEMENAME}/header.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="{$WEBPATH}themes/{$THEMENAME}/content.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="{$WEBPATH}themes/{$THEMENAME}/applet.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="{$WEBPATH}libs/js/sticky_note/sticky_note.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="{$WEBPATH}themes/{$THEMENAME}/table.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="{$WEBPATH}themes/{$THEMENAME}/rightbar.css" />
    <!-- voipiran msm -->
    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/rtl.css">   <!--  Voiz -->
    <!-- voipiran msm \-->
    <!-- Voiz: UI/UX layer (loaded last). NOTE: css/purple.css is intentionally NOT loaded -
         the redesign layer (voiz-ui.css) fully replaces its look. -->
    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/voiz-ui.css?v=6.0.0">

    {$HEADER_LIBS_JQUERY}
        <!--<script type='text/javascript' src="{$WEBCOMMON}js/base.js"></script>-->
        <!--<script type='text/javascript' src="{$WEBCOMMON}js/sticky_note.js"></script>-->
        <!--<script type='text/javascript' src="{$WEBCOMMON}js/iframe.js"></script>-->
		<script type='text/javascript' src="libs/js/base.js"></script>
        <script type='text/javascript' src="libs/js/sticky_note/sticky_note.js"></script>
        <script type='text/javascript' src="libs/js/iframe.js"></script>

        {$HEADER}
    {$HEADER_MODULES}
    <!-- Final theme contract: loaded after module-provided styles. -->
    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/voiz-repair.css?v=6.0.0">
    <!-- Voiz: Force Farsi calendar language if Calendar object exists -->
    <script type="text/javascript">
    (function () {
        if (typeof Calendar === 'undefined') return;
        Calendar._DN  = ["یکشنبه","دوشنبه","سه شنبه","چهارشنبه","پنجشنبه","جمعه","شنبه","یکشنبه"];
        Calendar._SDN = ["یک","دو","سه","چهار","پنج","جمعه","شنبه","یک"];
        Calendar._FD  = 6;
        Calendar._MN  = ["ژانویه","فوریه","مارس","آوریل","می","جون","جولای","آگوست","سپتامبر","اکتبر","نوامبر","دسامبر"];
        Calendar._SMN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        Calendar._JMN = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
        Calendar._JSMN= ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
        Calendar._NUMBERS = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
        Calendar._DIR = 'rtl';
        Calendar._TT = Calendar._TT || {};
        Calendar._TT["INFO"]      = "درباره تقویم";
        Calendar._TT["PREV_YEAR"] = "سال قبل";
        Calendar._TT["PREV_MONTH"]= "ماه قبل";
        Calendar._TT["GO_TODAY"]  = "رفتن به امروز";
        Calendar._TT["NEXT_MONTH"]= "ماه بعد";
        Calendar._TT["NEXT_YEAR"] = "سال بعد";
        Calendar._TT["SEL_DATE"]  = "انتخاب تاریخ";
        Calendar._TT["PART_TODAY"]= " (امروز)";
        Calendar._TT["DAY_FIRST"] = "ابتدا %s نمایش داده شود";
        Calendar._TT["CLOSE"]     = "بستن";
        Calendar._TT["TODAY"]     = "امروز";
        Calendar._TT["WK"]        = "هفته";
        Calendar._TT["TIME"]      = "زمان :";
        Calendar._TT["LAM"]       = "ق.ظ.";
        Calendar._TT["AM"]        = "ق.ظ.";
        Calendar._TT["LPM"]       = "ب.ظ.";
        Calendar._TT["PM"]        = "ب.ظ.";
    })();
    </script>
    </head>
    <body leftmargin="0" topmargin="0" marginwidth="0" marginheight="0" class="mainBody page-body" {$BODYPARAMS}>
    <div class="page-container">
        <div id="voiz-sidebar-overlay" class="voiz-sidebar-overlay"></div>

        {$MENU} <!-- Viene del tpl menu.tlp-->
                    {if !empty($mb_message)}
                    <div class="div_msg_errors" id="message_error">
                    {if !empty($mb_title)}
                        <div class="div_msg_errors_title">
                            <b>&nbsp;{$mb_title}</b>
                        </div>
                    {/if}
                        <div class="div_msg_errors_dismiss"><i class="fa fa-lg fa-remove" onclick="hide_message_error();"></i></div>
                        <div class="div_msg_errors_content" {if empty($mb_title)}style="margin-left: 0;"{/if}>{$mb_message}</div>
                    </div>
                    {/if}
                    {$CONTENT}
                </div>
            </div>
        </div><!-- neo-contentbox -->

        <!-- Footer -->
        <footer class="main">
            <span class="voiz-footer-brands">
                <!-- VOIPIRAN -->
                <a class="voiz-footer-brand" href="http://www.voipiran.io" target='_blank' rel="noopener">VOIPIRAN | ویپ ایران</a>
                <span class="sep">+</span>
                <!-- AKZ -->
                <a class="voiz-footer-brand" href="https://akzwp.com" target="_blank" rel="noopener">AKZ</a>
                <span class="sep">|</span>
                <a class="voiz-footer-brand" href="https://akzwp.ir" target="_blank" rel="noopener">akzwp.ir</a>
                <span class="sep">·</span>
                <span>{$ISSABEL_LICENSED} <a href="http://www.opensource.org/licenses/gpl-license.php" target='_blank'>GPL</a>. 2006 - {$currentyear}</span>
            </span>
        </footer>

        {*<br />*}
        </div><!-- main-content -->

        <div id="neo-sticky-note">
            <div id="neo-sticky-note-text"></div>
            <div id="neo-sticky-note-text-edit">
                <textarea id="neo-sticky-note-textarea"></textarea>
                <div id="neo-sticky-note-text-char-count"></div>
                <input type="button" value="{$SAVE_NOTE}" id="neo-submit-button" />
                <div id="auto-popup">AutoPopUp <input type="checkbox" id="neo-sticky-note-auto-popup" value="1" /></div>
            </div>
            <div id="neo-sticky-note-text-edit-delete"></div>
        </div>
{* SE GENERA EL AUTO POPUP SI ESTA ACTIVADO *}
{if $AUTO_POPUP eq '1'}{literal}
<script type='text/javascript'>
$(document).ready(function(e) {
    $("#neo-sticky-note-auto-popup").prop('checked', true);
    $('#togglestickynote1').click();
});
</script>
{/literal}{/if}

        <!-- Neo Progress Bar -->
        <div class="neo-modal-issabel-popup-box">
            <div class="neo-modal-issabel-popup-title"></div>
            <div class="neo-modal-issabel-popup-close"></div>
            <div class="neo-modal-issabel-popup-content"></div>
        </div>
        <div class="neo-modal-issabel-popup-blockmask"></div>
{if $ISSABEL_PANELS}
        <div id="chat" class="fixed">
            <div class="chat-inner">
                <h2 class="chat-header">
                    <a href="#" class="chat-close"><i class="entypo-cancel"></i></a>
                    <i class="entypo-users"></i>
                    {* TODO: i18n *}
                    <span id="panel-header-text">{$LBL_ISSABEL_PANELS_SIDEBAR|escape:html}</span>
                </h2>
                <div id="issabel-panels" class="panel-group joined">
                    {foreach from=$ISSABEL_PANELS key=panelname item=paneldata name=issabelpanel}
                    <div class="panel">
                        <div class="panel-heading">
                            <h4 class="panel-title">
                                <a data-toggle="collapse" data-parent="#issabel-panels" href="#issabel-panel-{$panelname}">
                                    {if $paneldata.iconclass}
                                    <i class="{$paneldata.iconclass}"></i>
                                    {elseif $paneldata.icon}
                                    <div style="display: inline-block; min-width: 15px; min-height: 15px; padding-right: 5px;">
                                    <img alt="" src="{$paneldata.icon}" width="15" />
                                    </div>
                                    {else}
                                    <i class="fa fa-file-o"></i>
                                    {/if}
                                    <span>{$paneldata.title|escape:html}</span>
                                </a>
                            </h4>
                        </div>
                        <div id="issabel-panel-{$panelname}" class="panel-collapse collapse{if $smarty.foreach.issabelpanel.first} in{/if}">
                            <div class="panel-body">{$paneldata.content}</div>
                        </div>
                    </div>
                    {/foreach}
                </div>
            </div>
        </div>
{/if}
        <!-- Bottom Scripts -->
        <script type='text/javascript' src="{$WEBPATH}themes/{$THEMENAME}/js/gsap/main-gsap.js"></script>
        <script type='text/javascript' src="{$WEBPATH}themes/{$THEMENAME}/js/bootstrap.js"></script>
        <script type='text/javascript' src="{$WEBPATH}themes/{$THEMENAME}/js/joinable.js"></script>
        <script type='text/javascript' src="{$WEBPATH}themes/{$THEMENAME}/js/resizeable.js"></script>
        <script type='text/javascript' src="{$WEBPATH}themes/{$THEMENAME}/js/neon-api.js"></script>
        <script type='text/javascript' src="{$WEBPATH}themes/{$THEMENAME}/js/jquery.validate.min.js"></script>
        <script type='text/javascript' src="{$WEBPATH}themes/{$THEMENAME}/js/neon-login.js"></script>
        <script type='text/javascript' src="{$WEBPATH}themes/{$THEMENAME}/js/neon-custom.js"></script>
        <script type='text/javascript' src="{$WEBPATH}themes/{$THEMENAME}/js/neon-demo.js"></script>
        <script type='text/javascript' src="{$WEBPATH}themes/{$THEMENAME}/js/voiz-ui.js"></script>
    </div>
</body>
</html>
