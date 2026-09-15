<!DOCTYPE html>
{*
  vim: set expandtab tabstop=4 softtabstop=4 shiftwidth=4:
  Codificación: UTF-8
  +----------------------------------------------------------------------+
  | Issabel version 0.5                                                  |
  | http://www.issabel.org                                               |
  +----------------------------------------------------------------------+
  | Copyright (c) 2006 Palosanto Solutions S. A.                         |
  | Copyright (c) 1997-2003 Palosanto Solutions S. A.                    |
  +----------------------------------------------------------------------+
  | The contents of this file are subject to the General Public License  |
  | (GPL) Version 2 (the "License"); you may not use this file except in |
  | compliance with the License. You may obtain a copy of the License at |
  | http://www.opensource.org/licenses/gpl-license.php                   |
  |                                                                      |
  | Software distributed under the License is distributed on an "AS IS"  |
  | basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See  |
  | the License for the specific language governing rights and           |
  | limitations under the License.                                       |
  +----------------------------------------------------------------------+
  | The Initial Developer of the Original Code is PaloSanto Solutions    |
  +----------------------------------------------------------------------+
  | Autores: Gladys Carrillo B.   <gcarrillo@palosanto.com>              |
  +----------------------------------------------------------------------+
  $Id: popup.tpl,v 1.1.1.1 2007/07/06 21:31:56 gcarrillo Exp $
*}
<html dir="rtl" lang="fa">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VOIZ | VOIPIRAN + AKZ</title>
  <script type='text/javascript'>
    (function () {
        var t = null;
        try { t = localStorage.getItem('voiz-theme'); } catch (e) { }
        if (t !== 'dark' && t !== 'light') { t = 'dark'; }
        document.documentElement.setAttribute('data-theme', t);
    })();
  </script>
  <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/styles.css">
  <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/help.css">
  <!-- Voiz: internal utility engine + redesign layer (always last) -->
  <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/voiz-tailwind.css?v=7.0.0">
  <script src="{$WEBCOMMON}js/base.js"></script>
  <script src="{$WEBCOMMON}js/iframe.js"></script>
</head>
<body class="voiz-popup-page" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">
{$CONTENT}
</body>
</html>
