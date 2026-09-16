<!DOCTYPE html>
<html dir="rtl" lang="fa">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">

        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="VOIZ - VOIPIRAN + AKZ | akzwp.com" />
        <meta name="author" content="VOIPIRAN + AKZ" />

        <title>{$PAGE_NAME} - VOIZ | VOIPIRAN + AKZ | akzwp.ir</title>

        <!-- Voiz: pre-paint theme init (avoids flash of wrong theme) -->
        <script type="text/javascript">
            (function () {
                var t = null;
                try { t = localStorage.getItem('voiz-theme'); } catch (e) { }
                if (t !== 'dark' && t !== 'light') { t = 'dark'; }
                document.documentElement.setAttribute('data-theme', t);
            })();
        </script>

        <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/bootstrap.css">
        <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/neon-theme.css">
        <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/neon-forms.css">
        <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/font-awesome-animation.min.css">
        <!-- Voiz: UI/UX layer (loaded last) -->
        <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/voiz-tailwind.css?v=7.1.0">

        <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->

        {$HEADER_LIBS_JQUERY}
    </head>
    <body class="page-body login-page" data-url="">

        <!-- theme toggle -->
        <div class="voiz-login-theme"><button type="button" class="voiz-theme-toggle voiz-icon-button" aria-label="تغییر تم روشن و تیره" aria-pressed="false"><i class="fa fa-moon-o" aria-hidden="true"></i></button></div>

        <!-- کانتینر اصلی: لوگو + فرم + فوتر -->
        <div class="login-wrapper">

            <!-- لوگو -->
            <div class="logovoiz">
                <a>
                    <img class="img-responsive" src="themes/{$THEMENAME}/images/voiz2.png" alt="VOIZ Logo" />
                </a>
            </div>

            <div class="voiz-login-intro"><h1>ورود به پنل مدیریت</h1><p>برای مدیریت ارتباطات، وارد حساب خود شوید.</p></div>
            <!-- فرم لاگین -->
            <div id="login">
                <div class="form-login-error" id="login-error" role="alert">
                    <h3>ورود ناموفق</h3>
                    <p>نام کاربری یا رمز عبور اشتباه است.</p>
                </div>

                <form method="post" id="login-form">
                    <fieldset>
                        <div class="voiz-login-field">
                            <label class="voiz-login-label" for="input_user"><i class="fa fa-user"></i>نام کاربری</label>
                            <input type="text" class="form-control" name="input_user" id="input_user" placeholder="نام کاربری" autocomplete="username" autocapitalize="none" spellcheck="false" required />
                        </div>
                        <div class="voiz-login-field">
                            <label class="voiz-login-label" for="input_pass"><i class="fa fa-lock"></i>رمز عبور</label>
                            <input type="password" class="form-control" name="input_pass" id="input_pass" placeholder="رمز عبور" autocomplete="current-password" required />
                        </div>
                        <div class="voiz-login-field">
                            <input name="submit_login" type="submit" value="ورود" />
                        </div>
                    </fieldset>
                </form>
            </div>

            <!-- فوتر -->
            <div class="fotter">
                <div class="copyr">
                    <p>
                        © VOIZ · <a href="http://www.voipiran.io" target="_blank" rel="noopener">VOIPIRAN | ویپ ایران</a>
                    </p>
                    <p class="voiz-login-brands">
                        طراحی رابط کاربری © <a href="https://akzwp.com" target="_blank" rel="noopener">AKZ · akzwp.com</a><span class="sep">|</span><a href="https://akzwp.ir" target="_blank" rel="noopener">akzwp.ir</a>
                    </p>
                </div>
            </div>

        </div>

        <!-- This is needed when you send requests via Ajax -->
        <script type="text/javascript">
            var baseurl = '';
        </script>

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
        <script type='text/javascript' src="{$WEBPATH}themes/{$THEMENAME}/js/voiz-ui.js?v=7.1.0"></script>

        <!-- نمایش خطا -->
        <script type="text/javascript">
            $(document).ready(function() {
                {if !empty($LOGIN_INCORRECT)}
                    $('#login-error').addClass('show');
                {/if}
                // تثبیت آیکون تم
                var voizTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
                $('.voiz-login-theme i').removeClass('fa-sun-o fa-moon-o').addClass(voizTheme === 'dark' ? 'fa-sun-o' : 'fa-moon-o');
            });
        </script>

    </body>
</html>
