![GitHub stars](https://img.shields.io/github/stars/voipiran/AsteriskGrafana?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/voipiran/AsteriskGrafana?style=for-the-badge)
![License](https://img.shields.io/github/license/voipiran/AsteriskGrafana?style=for-the-badge)

## VOIZ
 Persian Unified Communication 

ویز یک برنامه فارسی ساز و البته تکمیل کننده سیستم تلفنی معروف ایزابل Issabel است. در این بسته نرم افزاری تلاش شده بخش های مختلف سیستم تلفنی ایزابل به طور کامل فارسی شده و قابل استفاده برای کاربران و پروژه های داخلی ایران باشد و البته امکانات بیشمار به سیستم تلفنی ایزابل اضافه می کند که بازدهی و عملکرد این سیستم تلفنی معرف را افزایش می دهد.
**این سیستم تلفنی به طور رایگان توسط ویپ ایران VOPIRAN ارائه می گردد و دائما در حال به روز رسانی است.**

https://voipiran.io

## Instalation (راهنمای نصب)
1) install issabel iso file with Asterisk 16 or 18 (نسخه 4 یا 5)
[Download Issabel4 Nightly](https://sourceforge.net/projects/issabelpbx/files/Issabel%204/issabel4-NIGHTLY-AST18-USB-DVD-x86_64-20211207.iso/download)
[Download Issabel5](https://voipiran.io/download/)

2) update issabel
```
yum update -y
```
3) Run This command on your Linux CLI:
```
rm -rf voiz && \
curl -L https://github.com/voipiran/voiz/archive/refs/heads/master.zip -o voiz.zip && \
unzip -o -q voiz.zip && \
mv VOIZ-main voiz && \
cd voiz && \
chmod 777 install.sh && \
./install.sh

```



## Documents (مطالب راهنما و آموزش)

https://voiz.ir

## Give a Star! ⭐ یک ستاره به ما بدهید
If you like this project or plan to use it in the future, please give it a star. Thanks 🙏

## Features (امکانات سیستم تلفنی ویز، اضافه شده به ایزابل)

###فارسی سازی:

- دارای تقویم شمسی برای گزارش گیری بخش های ضبط مکالمات، ریز مکالمات، صنوق صوتی و مشاهده فکس
- دارای  پوسته theme راست چین و کاملا مناسب انجام پروژه های داخل ایران
- دارای متون فارسی برای تمامی بخش ها و البته به جز بخش تنظیمات تلفنی که به دلیل اصطلاحات تخصصی از همان متون انگلیسی استفاده شده است.
- دارای بسته فارسی پیام های صوتی استریسک Asterisk که توسط ویپ ایران ارائه شده است.
- اضافه شدن فایل  بیان تاریخ به فارسی که استریسک Asterisk به صورت پینش فرض فاقد آن است، این امکان برای کسانی که برنامه نویسی می کنند الزامی است.

###ماژول ها و امکانات تلفنی:

- پنل تلفن تحت وب برای کارشناس
- پنل مانیتورینگ صف
- پنل مانیتورینگ تماس
- ماژول گزارشگیری صف
- ماژول گزارشگیری CDR
- اضافه شدن ماژول ساخت گروهی تماس های ورودی Bulk DID به تنظیمات تلفنی. ** با این ماژول امکان ساخت گروهی Inbound Route را خواهید داشت.
- اضافه شدن ماژول مدیر منشی به تنظیمات تلفنی. ** با این ماژول امکان پیاده سازی سناریو معروف مدیر منشی در ایزابل امکان پذیر می شود.
- اضافه شدن ماژول Superfecta برای به روز رسانی کالر آی دی تماس گیرنده از منابع مختلف
- اضافه شدن ماژول Development که امکان ساخت منو جدید برای ایزابل و یا تغییر متون ایزابل را می دهد.
اضافه شدن سه Feature Code جدید، بیان تاریخ و زمان به شمسی، بیان تاریخ به شمسی و بیان زمان به فارسی
- امکان ارسال فکس به یک گزینه بر روی IVR شرکت مقابل


###سایر:

- نرم افزار ارتباط با مشتری ویتایگر فارسی
- برنامه htop برای نظارت بر استفاده از منابع بر روی لینوکس
- حذف پیام پاپ آپ رجیستر کردن ایزابل Issabel که بعد از ورود به محیط وب باز می شود.
- نصب برنامه Webmin و دسترسی به دنیایی از امکانات برای اعمال تغییرات در لینوکس
- قرار گرفتن نسخه قابل اجرا از برنامه Windcp بر روی سرور VOIZ، ** این امکان کمک بسیاری به راحتی نصب سیستم تلفنی یا پشتیبانی می کند.
- قرار گرفتن نسخه قابل اجرا از برنامه سافت فون Microsip بر روی سرور VOIZ، ** این امکان کمک بسیاری به راحتی نصب سیستم تلفنی یا پشتیبانی می کند.
- قرار گرفتن نسخه قابل اجرا از برنامه Putty  بر روی سرور VOIZ، ** این امکان کمک بسیاری به راحتی نصب سیستم تلفنی یا پشتیبانی می کند.
- نصب برنامه EasyVPN که یک محیط گرافیکی برای راه اندازی Open VPN Server است.



## TODO List (امکانات آینده)
- [ ] Add Documentations Menu
- [ ] Add Vtiger CRM Popup on Incomming Calls
- [ ] Transfer Webmin and Download file to Menus
- [ ] Define Default SIP Trunks
- [ ] add Installation GUI
- [ ] Improve English Theme
- [ ] Configure Linux Firewall and set APIBAN
- [ ] Show Faxes by Groups
- [ ] Add Glances System Monitoring Tools
- [X] Add Webrtc Webphone
- [X] VOIZ Installation script on Centos7 minimal


## Bugs and Feedback
For bugs, questions, and discussions, please use the Github Issues
