<!DOCTYPE html>
<html dir="ltr" lang="en">  <!--  Akz -->
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Issabel communications management" />
        <title>Issabel</title>
    <!-- Akz: pre-paint theme init (avoids flash of wrong theme) -->
    <script type='text/javascript'>
        (function () {
            var t = null;
            try { t = localStorage.getItem('akz-theme'); } catch (e) { }
            if (t !== 'dark' && t !== 'light') { t = 'dark'; }
            document.documentElement.setAttribute('data-theme', t);
        })();
    </script>

    <link rel="stylesheet" href="{$WEBPATH}libs/font-icons/font-awesome/css/font-awesome.min.css">
    <link rel="stylesheet" href="{$WEBPATH}libs/font-icons/entypo/css/entypo.css">
    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/bootstrap.css">     <!--  Akz -->
    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/neon-core.css">  <!--  Akz -->
     
    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/neon-theme.css"> <!--  Akz -->
    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/neon-forms.css"> <!--  Akz -->
    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/font-awesome-animation.min.css">
    

    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/styles.css" />
    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/widgets.css" />
    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/help.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="{$WEBPATH}themes/{$THEMENAME}/header.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="{$WEBPATH}themes/{$THEMENAME}/content.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="{$WEBPATH}themes/{$THEMENAME}/applet.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="{$WEBPATH}libs/js/sticky_note/sticky_note.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="{$WEBPATH}themes/{$THEMENAME}/table.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="{$WEBPATH}themes/{$THEMENAME}/rightbar.css" />
    
    
    <!-- Akz: UI/UX layer (loaded last). NOTE: css/purple.css is intentionally NOT loaded -
         the redesign layer (akz-ui.css) fully replaces its look. -->

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
    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/akz-tailwind.css?v=1.0.0">
    
    </head>
    <body leftmargin="0" topmargin="0" marginwidth="0" marginheight="0" class="mainBody page-body" {$BODYPARAMS}>
    <a class="akz-skip-link" href="#neo-contentbox">Skip to main content</a>
    <div class="page-container">
        <div id="akz-sidebar-overlay" class="akz-sidebar-overlay"></div>

        {$MENU} <!-- Viene del tpl menu.tlp-->
                    {if !empty($mb_message)}
                    <div class="div_msg_errors" id="message_error" role="alert">
                    {if !empty($mb_title)}
                        <div class="div_msg_errors_title">
                            <b>&nbsp;{$mb_title}</b>
                        </div>
                    {/if}
                        <div class="div_msg_errors_dismiss"><button type="button" aria-label="Dismiss message" title="Dismiss message" onclick="hide_message_error();"><i class="fa fa-times" aria-hidden="true"></i></button></div>
                        <div class="div_msg_errors_content" {if empty($mb_title)}style="margin-left: 0;"{/if}>{$mb_message}</div>
                    </div>
                    {/if}
                    {$CONTENT}
                </div>
            </div>
        </div><!-- neo-contentbox -->

        <!-- Footer -->
        <footer class="main">
            <span class="akz-footer-brands"><a href="https://www.issabel.org/" target="_blank" rel="noopener">Issabel</a><span>{$ISSABEL_LICENSED} <a href="https://www.gnu.org/licenses/gpl-2.0.html" target="_blank" rel="noopener">GPL</a></span><span>Theme by AKZ</span></span>
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
        <div class="neo-modal-issabel-popup-box" role="dialog" aria-modal="true" aria-labelledby="akz-modal-title" tabindex="-1">
            <div class="neo-modal-issabel-popup-title" id="akz-modal-title"></div>
            <button type="button" class="neo-modal-issabel-popup-close" aria-label="Close dialog"></button>
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
        <script type='text/javascript' src="{$WEBPATH}themes/{$THEMENAME}/js/neon-custom.js"></script>
        
        <script type='text/javascript' src="{$WEBPATH}themes/{$THEMENAME}/js/akz-ui.js?v=1.0.0"></script>
    </div>
</body>
</html>
