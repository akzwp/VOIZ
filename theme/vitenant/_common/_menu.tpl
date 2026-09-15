{literal}
    <script type='text/javascript'>
        var themeName = 'elastixneo'; //nombre del tema
        $(document).ready(function () {
            $("#togglebookmark").click(function () {
                var imgBookmark = $("#togglebookmark").attr('src');
                if (/bookmarkon.png/.test(imgBookmark)) {
                    $("#togglebookmark").attr('src', "web/themes/" + themeName + "/images/bookmark.png");
                } else {
                    $("#togglebookmark").attr('src', "web/themes/" + themeName + "/images/bookmarkon.png");
                }
            });
            $("#export_button").hover(
                    function () {
                        $(this).addClass("exportBorder");
                    },
                    function () {
                        $(this).removeClass("exportBorder");
                        $(this).attr("aria-expanded", "false");
                        $(this).removeClass("exportBackground");
                        $(".letranodec").css("color", "#444444");
                        $("#subMenuExport").addClass("neo-display-none");
                    }
            );
            $("#neo-table-button-download-right").click(
                    function () {
                        if ($(this).attr("aria-expanded") == "false") {
                            var exportPosition = $('#export_button').position();
                            var top = exportPosition.top + 41;
                            var left = exportPosition.left - 3;
                            $("#subMenuExport").css('top', top + "px");
                            $("#subMenuExport").css('left', left + "px");
                            $(this).attr("aria-expanded", "true");
                            $(this).addClass("exportBackground");
                            $(".letranodec").css("color", "#FFFFFF");
                            $("#subMenuExport").removeClass("neo-display-none");
                        } else {
                            $(".letranodec").css("color", "#444444");
                            $("#subMenuExport").addClass("neo-display-none");
                            $(this).removeClass("exportBackground");
                            $(this).attr("aria-expanded", "false");
                        }
                    }
            );
			
            $("#subMenuExport").hover(
                    function () {
                        $(this).removeClass("neo-display-none");
                        $(".letranodec").css("color", "#FFFFFF");
                        $("#export_button").attr("aria-expanded", "true");
                        $("#export_button").addClass("exportBackground");
                    },
                    function () {
                        $(this).addClass("neo-display-none");
                        $(".letranodec").css("color", "#444444");
                        $("#export_button").removeClass("exportBackground");
                        $("#export_button").attr("aria-expanded", "false");
                    }
            );
            $('#header_open_sidebar, a.chat-close').click(function (e) {
                $('div.page-container').toggleClass('chat-visible');
                toggle_sidebar_menu(true);
                e.stopPropagation();
            });
        });
        function removeNeoDisplayOnMouseOut(ref) {
            $(ref).find('div').addClass('neo-display-none');
        }
        function removeNeoDisplayOnMouseOver(ref) {
            $(ref).find('div').removeClass('neo-display-none');
        }
        function gotowebmin() {
            var obj = $("#webmin_link");
            var xaddr = "https://" + window.location.hostname + ":10000";
            $(obj).attr("href", xaddr);
        }
        function gotoQueueDashboard() {
            var obj = $("#queue_dashboard_link");
            var xaddr = "http://" + window.location.hostname + ":5000";
            $(obj).attr("href", xaddr);
            window.open(xaddr, '_blank');
        }
        $(document).ready(
                function ()
                {
                    gotowebmin();
                    // gotoQueueDashboard() حذف شد تا فقط با کلیک اجرا بشه
                }
        );
        function gotocrm() {
            var obj = $("#crm_link");
            var xaddr = "https://" + window.location.hostname + "/crm";
            $(obj).attr("href", xaddr);
        }
        function gotowinscp() {
            var obj = $("#winscp_link");
            var xaddr = "https://" + window.location.hostname + "/download/WinSCP-Portable.zip";
            $(obj).attr("href", xaddr);
        }
        function gotoputty() {
            var obj = $("#putty_link");
            var xaddr = "https://" + window.location.hostname + "/download/putty.exe";
            $(obj).attr("href", xaddr);
        }
        function gotosoftphone() {
            var obj = $("#softphone_link");
            var xaddr = "https://" + window.location.hostname + "/download/MicroSIP.zip";
            $(obj).attr("href", xaddr);
        }
        function gotowebphone() {
            var obj = $("#webphone_link");
            var xaddr = "https://" + window.location.hostname + "/phone";
            $(obj).attr("href", xaddr);
        }
        $(document).ready(
                function ()
                {
                    gotocrm();
                    gotowinscp();
                    gotoputty();
                    gotosoftphone();
                    gotowebphone();
                }
        );
    </script>
{/literal}
<input type="hidden" id="lblRegisterCm" value="{$lblRegisterCm}" />
<input type="hidden" id="lblRegisteredCm" value="{$lblRegisteredCm}" />
<input type="hidden" id="userMenuColor" value="{$MENU_COLOR}" />
<input type="hidden" id="lblSending_request" value="{$SEND_REQUEST}" />
<input type="hidden" id="toolTip_addBookmark" value="{$ADD_BOOKMARK}" />
<input type="hidden" id="toolTip_removeBookmark" value="{$REMOVE_BOOKMARK}" />
<input type="hidden" id="toolTip_addingBookmark" value="{$ADDING_BOOKMARK}" />
<input type="hidden" id="toolTip_removingBookmark" value="{$REMOVING_BOOKMARK}" />
<input type="hidden" id="toolTip_hideTab" value="{$HIDE_IZQTAB}" />
<input type="hidden" id="toolTip_showTab" value="{$SHOW_IZQTAB}" />
<input type="hidden" id="toolTip_hidingTab" value="{$HIDING_IZQTAB}" />
<input type="hidden" id="toolTip_showingTab" value="{$SHOWING_IZQTAB}" />
<input type="hidden" id="amount_char_label" value="{$AMOUNT_CHARACTERS}" />
<input type="hidden" id="save_note_label" value="{$MSG_SAVE_NOTE}" />
<input type="hidden" id="get_note_label" value="{$MSG_GET_NOTE}" />
<input type="hidden" id="issabel_theme_name" value="{$THEMENAME}" />
<input type="hidden" id="lbl_no_description" value="{$LBL_NO_STICKY}" />
<input type="hidden" id="version" value="{$VERSION}" />
<!-- inicio del menú tipo acordeon-->
<nav id="voiz-sidebar" class="sidebar-menu tw-flex tw-flex-col" aria-label="منوی اصلی">
    <header class="logo-env">
        <a href="index.php" class="voiz-brand">
            <img src="{$WEBPATH}themes/{$THEMENAME}/images/logov.png" width="32" height="38" alt="" />
            <span><strong dir="ltr">VOIZ</strong><small>پنل مدیریت ارتباطات</small></span>
        </a>
        <button type="button" class="voiz-sidebar-close voiz-icon-button" aria-label="بستن منو"><i class="fa fa-times" aria-hidden="true"></i></button>
    </header>
    <div class="voiz-sidebar-label">دسترسی به بخش‌ها</div>
    <ul id="main-menu" class="main-menu">
        <!-- add class "multiple-expanded" to allow multiple submenus to open -->
        <!-- class "auto-inherit-active-class" will automatically add "active" class for parent elements who are marked already with class "active" -->
        <!--recorremos el arreglo del menu nivel primario-->
        {foreach from=$arrMainMenu key=idMenu item=menu name=menuMain}
            {if $idMenu eq $idMainMenuSelected}
                <li class="active opened">
                {else}
                <li>
                {/if}
                <a href="index.php?menu={$idMenu}">
                    <i class="{$menu.icon}"></i>
                   <!--<span>{$idMenu}</span>-->
                   <!--<span>{$menu.description}</span>-->
                    <span>{$menu.Name}</span>
                </a>
                <ul>
                    <!--recorremos el arreglo del menu nivel secundario-->
                    {foreach from=$menu.children key=idSubMenu item=subMenu}
                        {if $idSubMenu eq $idSubMenuSelected}
                            <li class="active opened">
                            {else}
                            <li>
                            {/if}
                            <a href="index.php?menu={$idSubMenu}">
                                <i class="{$subMenu.icon}"></i>
                                <!--<span>{$idSubMenu}</span>-->
                                <!--<span>{$subMenu.description}</span>-->
                                <span>{$subMenu.Name}</span>
                            </a>
                            {if $subMenu.children}
                                <ul>
                                    <!--recorremos el arreglo del menu de tercer nivel-->
                                    {foreach from=$subMenu.children key=idSubMenu2 item=subMenu2}
                                        <li>
                                            <a href="index.php?menu={$idSubMenu2}">
                                                <!--<span>{$idSubMenu2}</span>-->
                                                <!--<span>{$subMenu2.description}</span>-->
                                                <span>{$subMenu2.Name}</span>
                                            </a>
                                        </li>
                                    {/foreach}
                                </ul>
                            {/if}
                        </li>
                    {/foreach}
                </ul>
            </li>
        {/foreach}
        {$SHORTCUT}
    </ul>
    <div class="voiz-sidebar-credit">طراحی رابط کاربری · <a href="https://akzwp.com" target="_blank" rel="noopener">AKZ</a></div>
</nav>
<!-- fin del menú tipo acordeon-->
<!-- inicio del head principal-->
<div class="main-content tw-min-w-0">
    <!-- Voiz topbar: logo / search / actions / user / theme -->
    <div class="voiz-topbar tw-flex tw-items-center">
        <button type="button" class="voiz-topbar-burger" aria-controls="voiz-sidebar" aria-expanded="false" aria-label="باز کردن منو"><i class="fa fa-bars" aria-hidden="true"></i></button>

        <div class="voiz-topbar-logo">
            <a href="#">
                <img src="{$WEBPATH}themes/{$THEMENAME}/images/logo-light.png" alt="voiz" />
            </a>
            <kbd>version {$VERSION}</kbd>
        </div>

        <div class="voiz-topbar-search">
            <form method="get" action="">
                <i class="fa fa-search voiz-search-icon"></i>
                <input type="text" id="search_module_issabel" name="search_module_issabel" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="voiz-search-results" placeholder="{$MODULES_SEARCH}" aria-label="{$MODULES_SEARCH}"/>
                <button type="submit" aria-label="جستجو در منوها"><i class="fa fa-arrow-left" aria-hidden="true"></i></button>
            </form>
        </div>

        <span class="voiz-topbar-sep"></span>

        <ul class="voiz-topbar-actions list-inline links-list neo-topbar-notification tw-flex tw-items-center">
            <li id="header_downloads_bar" class="dropdown top-bar-downloads">
                <a data-toggle="dropdown" class="" href="#" title="دریافت ابزارها" aria-label="دریافت ابزارها">
                    <i class="fa fa-download"></i>
                </a>
                <ul class="dropdown-menu">
                    <li class="caret"></li>
                    <li><a target="_blank" id="winscp_link" class="" href=""><i class="fa fa-external-link"></i>Winscp</a></li>
                    <li><a target="_blank" id="putty_link" class="" href=""><i class="fa fa-external-link"></i>Putty</a></li>
                    <li><a target="_blank" id="softphone_link" class="" href=""><i class="fa fa-external-link"></i>Softphone</a></li>
                </ul>
            </li>
            <li class="dropdown top-bar-webmin">
                <a id="webmin_link" href="#" onclick="gotowebmin(); return false;" target="_blank" title="Webmin" aria-label="Webmin">
                    <i class="fa fa-cog"></i>
                </a>
            </li>
            <li class="dropdown top-bar-webphone">
                <a id="webphone_link" href="https://{$SERVER_NAME}/phone" target="_blank" rel="noopener" title="تلفن تحت وب" aria-label="تلفن تحت وب">
                    <i class="fa fa-phone"></i>
                </a>
            </li>
            <li class="dropdown top-bar-queue">
                <a id="queue_dashboard_link" href="#" onclick="gotoQueueDashboard(); return false;" class="" title="داشبورد صف" aria-label="داشبورد صف">
                    <i class="fa fa-bar-chart"></i>
                </a>
            </li>
            <li id="header_info_bar" class="dropdown top-bar-info">
                <a data-toggle="dropdown" class="" href="#" aria-label="اطلاعات و سازندگان" title="اطلاعات و سازندگان">
                    <i class="fa fa-info-circle"></i>
                </a>
                <ul class="dropdown-menu">
                    <li class="caret"></li>
                    <li><a href="#" class="register_link">{$Registered}</a></li>
                    <li><a href="#" id="viewDetailsRPMs"><i class="fa fa-cube"></i>{$VersionDetails}</a></li>
                    <li><a href="http://www.voipiran.io" target="_blank" rel="noopener"><i class="fa fa-external-link"></i>VOIPIRAN | ویپ ایران</a></li>
                    <li class="dropdown-header">طراحی رابط کاربری © AKZ</li>
                    <li><a href="https://akzwp.com" target="_blank" rel="noopener"><i class="fa fa-globe"></i>AKZ | akzwp.com</a></li>
                    <li><a href="https://akzwp.ir" target="_blank" rel="noopener"><i class="fa fa-globe"></i>AKZ | akzwp.ir</a></li>
                    <li><a href="#" id="dialogaboutissabel"><i class="fa fa-info-circle"></i>{$ABOUT_ISSABEL2}</a></li>
                </ul>
            </li>
            <li id="header_notification_bar" class="dropdown">
                <a data-toggle="dropdown" class="" href="#" aria-label="اعلان‌ها" title="اعلان‌ها">
                    <i id="notibell" class="fa fa-bell-o {$ANIMATE_NOTIFICATION}"></i>
                </a>
                <ul class="dropdown-menu">
                    <li class="caret"></li>
                    <li><p>{$NOTIFICATIONS.LBL_NOTIFICATION_SYSTEM}</p></li>
                    <li>
                        <ul>
                            {foreach from=$NOTIFICATIONS.NOTIFICATIONS_PUBLIC item=NOTI}
                                <li id="notiitem{$NOTI.id}" class="{if $NOTI.level == "info"}notification-info{elseif $NOTI.level == "warning"}notification-warning{elseif $NOTI.level == "error"}notification-danger{/if}">
                                    <a href="#" onclick='readNoti("{$NOTI.id}")'><i class="{if $NOTI.level == "info"}fa fa-info{elseif $NOTI.level == "warning"}fa fa-warning{elseif $NOTI.level == "error"}fa fa-ban{/if}"></i>{$NOTI.content}</a>
                                </li>
                            {foreachelse}
                                <li><p>{$NOTIFICATIONS.TXT_NO_NOTIFICATIONS}</p></li>
                            {/foreach}
                        </ul>
                    </li>
                    <li><p>{$NOTIFICATIONS.LBL_NOTIFICATION_USER}</p></li>
                    <li>
                        <ul>
                            {foreach from=$NOTIFICATIONS.NOTIFICATIONS_PRIVATE item=NOTI}
                                <li class="{if $NOTI.level == "info"}notification-info{elseif $NOTI.level == "warning"}notification-warning{elseif $NOTI.level == "error"}notification-danger{/if}">
                                    <a href="#"><i class="{if $NOTI.level == "info"}fa fa-info{elseif $NOTI.level == "warning"}fa fa-warning{elseif $NOTI.level == "error"}fa fa-ban{/if}"></i>{$NOTI.content}</a>
                                </li>
                            {foreachelse}
                                <li><p>{$NOTIFICATIONS.TXT_NO_NOTIFICATIONS}</p></li>
                            {/foreach}
                        </ul>
                    </li>
                </ul>
            </li>
            {if $ISSABEL_PANELS}
                <li id="header_open_sidebar" class="dropdown">
                    <a href="#" data-toggle="chat" data-collapse-sidebar="1"><i class="fa fa-th-list"></i></a>
                </li>
            {/if}
        </ul>

        <span class="voiz-topbar-sep"></span>

        <div class="voiz-topbar-user">
            <a href="#" class="voiz-user-link dropdown-toggle" data-toggle="dropdown">
                <img style="border:0px" src="/themes/{$THEMENAME}/images/Icon-user.png" alt="" />
                <span class="voiz-user-name">{$USER_LOGIN}</span>
                <i class="fa fa-angle-down voiz-user-caret"></i>
            </a>
            <ul class="dropdown-menu">
                <li class="caret"></li>
                <li>
                    <a href="#" class="setadminpassword">
                        <i class="fa fa-user"></i>
                        {$CHANGE_PASSWORD}
                    </a>
                </li>
                <li>
                    <a href="index.php?logout=yes">
                        <i class="fa fa-sign-out"></i>
                        {$LOGOUT}
                    </a>
                </li>
            </ul>
        </div>

        <button type="button" class="voiz-theme-toggle" aria-label="تغییر تم روشن و تیره" aria-pressed="false">
            <i class="fa fa-moon-o"></i>
        </button>
    </div>
    <!-- Breadcrumb 3 -->
    <ol class="breadcrumb bc-2">
        {foreach from=$BREADCRUMB item=value name=menu}
            {if $smarty.foreach.menu.first}
                <li>
                    <a href="/"> <i class="entypo-home"></i></a>
                    <a href="#"> {$value}</a>
                </li>
            {elseif $smarty.foreach.menu.last}
                <li class="active"><strong>{$value}</strong></li>
                    {else}
                <li><a href="#">{$value}</a></li>
                {/if}
            {/foreach}
        <li id="tenant-help">
            <a class="" href="#" onclick="popUp('help/?id_nodo={if !empty($idSubMenu2Selected)}{$idSubMenu2Selected}&name_nodo={$nameSubMenu2Selected}{else}{$idSubMenuSelected}&name_nodo={$nameSubMenuSelected}{/if}', '1000', '460')">
                <!--a href="https://www.voipiran.io" target="_bank"-->
                <i class="fa fa-support"></i>
            </a>
        </li>
        <li id="tenant-sticky" class="dropdown">
            <a id="togglestickynote1" href="#">
                <i class="fa fa-sticky-note"></i>
            </a>
        </li>
    </ol>
    <!-- contenido del modulo-->
    <div id="neo-contentbox" role="main" tabindex="-1">
        <div id="neo-contentbox-maincolumn">
            <input type="hidden" id="issabel_framework_module_id" value="{if empty($idSubMenu2Selected)}{$idSubMenuSelected}{else}{$idSubMenu2Selected}{/if}" />
            <input type="hidden" id="issabel_framework_webCommon" value="{$WEBCOMMON}" />
            <div class="neo-module-content">
