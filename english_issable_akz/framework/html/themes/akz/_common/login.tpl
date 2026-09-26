<!DOCTYPE html>
<html dir="ltr" lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">

        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Sign in to Issabel" />
        <meta name="author" content="AKZ" />

        <title>Sign in | Issabel</title>

        <!-- Akz: pre-paint theme init (avoids flash of wrong theme) -->
        <script type="text/javascript">
            (function () {
                var t = null;
                try { t = localStorage.getItem('akz-theme'); } catch (e) { }
                if (t !== 'dark' && t !== 'light') { t = 'dark'; }
                document.documentElement.setAttribute('data-theme', t);
            })();
        </script>

        <link rel="stylesheet" href="{$WEBPATH}libs/font-icons/font-awesome/css/font-awesome.min.css">
    <link rel="stylesheet" href="{$WEBPATH}libs/font-icons/entypo/css/entypo.css">
    <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/bootstrap.css">
        <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/neon-theme.css">
        <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/neon-forms.css">
        <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/font-awesome-animation.min.css">
        <!-- Akz: UI/UX layer (loaded last) -->
        <link rel="stylesheet" href="{$WEBPATH}themes/{$THEMENAME}/css/akz-tailwind.css?v=1.0.0">

        <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->

        {$HEADER_LIBS_JQUERY}
    </head>
    <body class="page-body login-page" data-url="">

        <!-- theme toggle -->
        <div class="akz-login-theme"><button type="button" class="akz-theme-toggle akz-icon-button" aria-label="Toggle light and dark theme" aria-pressed="false"><i class="fa fa-moon-o" aria-hidden="true"></i></button></div>

        
        <div class="login-wrapper">

            
            <div class="logoakz">
                <a>
                    <img class="img-responsive" src="themes/{$THEMENAME}/images/issabel-wordmark.svg" alt="Issabel Logo" />
                </a>
            </div>

            <div class="akz-login-intro"><h1>Sign in to Issabel</h1><p>Sign in to manage your communications.</p></div>
            
            <div id="login">
                <div class="form-login-error" id="login-error" role="alert">
                    <h3>Sign-in failed</h3>
                    <p>The username or password is incorrect.</p>
                </div>

                <form method="post" id="login-form">
                    <fieldset>
                        <div class="akz-login-field">
                            <label class="akz-login-label" for="input_user"><i class="fa fa-user"></i>Username</label>
                            <input type="text" class="form-control" name="input_user" id="input_user" placeholder="Username" autocomplete="username" autocapitalize="none" spellcheck="false" required />
                        </div>
                        <div class="akz-login-field">
                            <label class="akz-login-label" for="input_pass"><i class="fa fa-lock"></i>Password</label>
                            <input type="password" class="form-control" name="input_pass" id="input_pass" placeholder="Password" autocomplete="current-password" required />
                        </div>
                        <div class="akz-login-field">
                            <input name="submit_login" type="submit" value="Sign in" />
                        </div>
                    </fieldset>
                </form>
            </div>

            
            <div class="fotter">
                <div class="copyr"><p><a href="https://www.issabel.org/" target="_blank" rel="noopener">Issabel</a> · Theme by AKZ</p></div>
            </div>

        </div>

        <!-- This is needed when you send requests via Ajax -->
        <script type="text/javascript">
            var baseurl = '';
        </script>

        <!-- Bottom Scripts -->
        
        
        
        
        
        
        
        
        
        <script type='text/javascript' src="{$WEBPATH}themes/{$THEMENAME}/js/akz-ui.js?v=1.0.0"></script>

        
        <script type="text/javascript">
            $(document).ready(function() {
                {if !empty($LOGIN_INCORRECT)}
                    $('#login-error').addClass('show');
                {/if}

                var akzTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
                $('.akz-login-theme i').removeClass('fa-sun-o fa-moon-o').addClass(akzTheme === 'dark' ? 'fa-sun-o' : 'fa-moon-o');
            });
        </script>

    </body>
</html>
