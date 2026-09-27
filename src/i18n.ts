export type Language = 'en' | 'fa' | 'hy' | 'ru'

export const languageNames: Record<Language, string> = {
  en: 'English', fa: 'فارسی', hy: 'Հայերեն', ru: 'Русский',
}

export const languageTags: Record<Language, string> = {
  en: 'en', fa: 'fa', hy: 'hy', ru: 'ru',
}

type StepText = { title: string; body: string }
type PlanText = { tag: string; name: string; price: string; items: string[] }

export interface LocaleText {
  available: string; menu: string; close: string; soundOn: string; soundOff: string; soundLabel: string; languageLabel: string
  nav: string[]; scroll: string; heroKicker: string; heroCopy: string; ticker: string[]
  sections: string[]; workPlaceholder: string; projectKinds: string[]
  reelPlaceholder: string; reelLabel: string; stats: string[]; statValues: string[]
  aboutHeading: [string, string]; aboutParagraphs: [string, string]; skills: string[]; portraitCaption: string
  steps: StepText[]; frame: string; scrub: string
  plansNote: string; plans: PlanText[]; bookThis: string
  postTitles: string[]; readMinutes: string; feedPlaceholder: string; comingSoon: string
  contactHeading: [string, string]; nextOpening: string; fields: string[]; placeholders: string[]
  prepareEmail: string; emailPrepared: string
  giftEyebrow: string; giftHeading: [string, string]; giftNote: string; giftRoute: string; giftDestination: string
  ticketOneWay: string; ticketTagline: string; endLabel: string; backToTop: string; footerRole: string
}

export const text: Record<Language, LocaleText> = {
  en: {
    available: 'Available · 2026', menu: 'Menu', close: 'Close', soundOn: 'Sound on', soundOff: 'Sound off', soundLabel: 'Sound', languageLabel: 'Language',
    nav: ['Work', 'Reel', 'About', 'Process', 'Packages', 'Journal', 'Contact'], scroll: 'Scroll to explore',
    heroKicker: 'Cinematic & trend-led video. Artistic stills. One camera, one operator, no filler.',
    heroCopy: 'I shoot films that hold attention and photographs that hold still. Brand work, music, portraits — cut for the platform they live on.',
    ticker: ['Cinematic film', 'Trend edits', 'Artistic stills', 'Colour grade'],
    sections: ['Selected work', 'Showreel 2026', 'About', 'How we shoot', 'Packages', 'Journal', 'Feed', 'Booking'],
    workPlaceholder: 'Project still — coming soon',
    projectKinds: ['Brand film', 'Editorial', 'Music video', 'Sport short', 'Portraits', 'Event documentary'],
    reelPlaceholder: 'Showreel master coming soon', reelLabel: 'The reel',
    stats: ['Films delivered', 'Behind the camera', 'Typical first cut', 'Countries shot in'], statValues: ['140+', '9 yrs', '48 h', '11'],
    aboutHeading: ['Frames that', 'don’t blink'],
    aboutParagraphs: [
      'I direct, shoot and cut. Cinematic pieces when a brand needs weight, trend-led edits when it needs reach, and artistic stills that carry the same grade as the film they came from.',
      'Small crew by design: fewer people on set means faster decisions, longer takes and a subject who forgets the camera is there. Colour and sound finished in-house, so what you approve is what ships.',
    ],
    skills: ['Direction', 'Cinematography', 'Trend edits', 'Portraiture', 'Colour grade', 'Sound design'], portraitCaption: 'Behind / in front of the lens',
    steps: [
      { title: 'Brief', body: 'A call, references, and the one thing the piece has to do. I come back with a treatment and a fixed price.' },
      { title: 'Prep', body: 'Locations scouted, shot list locked, light plan drawn. Nothing improvised that can be decided in advance.' },
      { title: 'Shoot', body: 'One operator, natural direction, long takes. Stills captured in the same setups so the two sets match.' },
      { title: 'Finish', body: 'Edit, grade and sound in-house. One round of notes included, delivered in every aspect ratio you need.' },
    ],
    frame: 'Frame', scrub: 'Sequence · scrub', plansNote: 'Half-day minimum · travel quoted separately',
    plans: [
      { tag: 'Half day', name: 'Single', price: 'From 850', items: ['4 hours on location', 'One 30–60s edit', '15 graded stills', 'Vertical cut included'] },
      { tag: 'Full day', name: 'Campaign', price: 'From 2 400', items: ['10 hours, one location move', 'Hero film up to 2 min', '3 social cuts', '40 graded stills', 'Licensed 12 months'] },
      { tag: 'Retainer', name: 'Monthly', price: 'From 3 900 / mo', items: ['Two shoot days a month', '8 edits per month', 'Rolling stills library', 'Priority turnaround'] },
    ],
    bookThis: 'Book this',
    postTitles: ['Shooting film look on a mirrorless body without killing your highlights', 'Why I light portraits with one source and a piece of black foam', 'Cutting for the feed: the first 1.5 seconds decide everything'],
    readMinutes: 'min', feedPlaceholder: 'Post', comingSoon: 'coming soon',
    contactHeading: ['Let’s', 'roll'], nextOpening: 'Next opening: Nov 2026', fields: ['Name', 'Email', 'Project', 'Dates'],
    placeholders: ['Who is asking', 'Where to reply', 'Brand film, portraits, event…', 'Rough window is fine'],
    prepareEmail: 'Prepare enquiry email', emailPrepared: 'Your email app will open with the enquiry ready to send.',
    giftEyebrow: 'One more frame', giftHeading: ['New place.', 'Same fire.'],
    giftNote: 'Every journey deserves a beginning worth remembering. Take your eye, your courage and your story wherever you go.',
    giftRoute: 'From here', giftDestination: 'To Armenia', ticketOneWay: 'One way', ticketTagline: 'Made for the next chapter', endLabel: 'End', backToTop: 'Back to top', footerRole: 'Video & photography',
  },
  fa: {
    available: 'آمادهٔ همکاری · ۲۰۲۶', menu: 'منو', close: 'بستن', soundOn: 'صدا روشن', soundOff: 'صدا خاموش', soundLabel: 'صدا', languageLabel: 'زبان',
    nav: ['آثار', 'شوریل', 'درباره', 'روند کار', 'پکیج‌ها', 'یادداشت‌ها', 'تماس'], scroll: 'برای دیدن اسکرول کن',
    heroKicker: 'ویدیوهای سینمایی و روزآمد. عکس‌های هنری. یک دوربین، یک نگاه، بدون اضافه‌کاری.',
    heroCopy: 'فیلم‌هایی می‌سازم که نگاه را نگه می‌دارند و عکس‌هایی که زمان را متوقف می‌کنند؛ برای برند، موسیقی و پرتره، متناسب با جایی که دیده می‌شوند.',
    ticker: ['فیلم سینمایی', 'تدوین روزآمد', 'عکس هنری', 'رنگ‌پردازی'],
    sections: ['آثار منتخب', 'شوریل ۲۰۲۶', 'درباره', 'روند ساخت', 'پکیج‌ها', 'یادداشت‌ها', 'گالری', 'رزرو'],
    workPlaceholder: 'تصویر پروژه — به‌زودی',
    projectKinds: ['فیلم برند', 'ادیتوریال', 'موزیک‌ویدیو', 'فیلم ورزشی', 'پرتره', 'مستند رویداد'],
    reelPlaceholder: 'نسخهٔ اصلی شوریل به‌زودی', reelLabel: 'شوریل',
    stats: ['فیلم تحویل‌داده‌شده', 'سال پشت دوربین', 'زمان معمول نسخهٔ اول', 'کشور محل فیلم‌برداری'], statValues: ['۱۴۰+', '۹ سال', '۴۸ ساعت', '۱۱'],
    aboutHeading: ['قاب‌هایی که', 'پلک نمی‌زنند'],
    aboutParagraphs: [
      'کارگردانی می‌کنم، فیلم می‌گیرم و تدوین می‌کنم. وقتی یک برند به عمق نیاز دارد، تصویر سینمایی می‌سازم؛ وقتی به دیده‌شدن نیاز دارد، تدوینی پرانرژی. عکس‌ها هم همان زبان بصری فیلم را دارند.',
      'گروه کوچک، انتخابی آگاهانه است: تصمیم‌های سریع‌تر، برداشت‌های طولانی‌تر و آدم‌هایی که حضور دوربین را فراموش می‌کنند. رنگ و صدا هم همین‌جا نهایی می‌شود تا خروجی دقیقاً همان چیزی باشد که تأیید کرده‌اید.',
    ],
    skills: ['کارگردانی', 'فیلم‌برداری', 'تدوین', 'پرتره', 'رنگ‌پردازی', 'طراحی صدا'], portraitCaption: 'پشت و جلوی لنز',
    steps: [
      { title: 'گفت‌وگو', body: 'یک تماس، چند مرجع و مهم‌ترین هدف پروژه. بعد طرح اجرایی و قیمت مشخص ارائه می‌شود.' },
      { title: 'آماده‌سازی', body: 'لوکیشن، فهرست نماها و نورپردازی از قبل آماده می‌شوند. چیزی که می‌توان برنامه‌ریزی کرد به شانس سپرده نمی‌شود.' },
      { title: 'فیلم‌برداری', body: 'یک فیلم‌بردار، هدایت طبیعی و برداشت‌های بلند. عکس‌ها هم در همان فضا ثبت می‌شوند تا همه‌چیز یکپارچه باشد.' },
      { title: 'نهایی‌سازی', body: 'تدوین، رنگ و صدا در یک مسیر واحد انجام می‌شود. یک دور بازخورد و خروجی در نسبت‌های تصویری موردنیاز شما.' },
    ],
    frame: 'قاب', scrub: 'سکانس · مرور', plansNote: 'حداقل نیم‌روز · هزینهٔ سفر جداگانه',
    plans: [
      { tag: 'نیم‌روز', name: 'تک‌پروژه', price: 'از ۸۵۰', items: ['۴ ساعت در لوکیشن', 'یک ویدیوی ۳۰ تا ۶۰ ثانیه‌ای', '۱۵ عکس رنگ‌شده', 'نسخهٔ عمودی'] },
      { tag: 'روز کامل', name: 'کمپین', price: 'از ۲٬۴۰۰', items: ['۱۰ ساعت و یک جابه‌جایی لوکیشن', 'فیلم اصلی تا ۲ دقیقه', '۳ برش برای شبکه‌های اجتماعی', '۴۰ عکس رنگ‌شده', 'مجوز استفادهٔ ۱۲ ماهه'] },
      { tag: 'همکاری مستمر', name: 'ماهانه', price: 'از ۳٬۹۰۰ / ماه', items: ['دو روز فیلم‌برداری در ماه', '۸ تدوین در ماه', 'آرشیو عکس پیوسته', 'اولویت در تحویل'] },
    ],
    bookThis: 'رزرو این پکیج',
    postTitles: ['چطور با دوربین بدون‌آینه حال‌وهوای فیلم بسازیم و جزئیات نور را نگه داریم', 'چرا پرتره‌ها را با یک منبع نور و یک صفحهٔ مشکی نورپردازی می‌کنم', 'تدوین برای فید: یک‌ونیم ثانیهٔ اول همه‌چیز را تعیین می‌کند'],
    readMinutes: 'دقیقه', feedPlaceholder: 'پست', comingSoon: 'به‌زودی',
    contactHeading: ['شروع', 'کنیم'], nextOpening: 'نوبت بعدی: نوامبر ۲۰۲۶', fields: ['نام', 'ایمیل', 'پروژه', 'زمان'],
    placeholders: ['چه کسی پیام می‌دهد؟', 'آدرس پاسخ', 'فیلم برند، پرتره، رویداد…', 'بازهٔ تقریبی کافی است'],
    prepareEmail: 'آماده‌کردن ایمیل', emailPrepared: 'برنامهٔ ایمیل شما با متن آماده باز می‌شود؛ ارسال نهایی با شماست.',
    giftEyebrow: 'یک قاب دیگر', giftHeading: ['جای تازه.', 'همان آتش.'],
    giftNote: 'هر سفر، شروعی می‌خواهد که به یاد بماند. نگاهت، شجاعتت و داستانت را هر جا که می‌روی با خودت ببر.',
    giftRoute: 'از اینجا', giftDestination: 'به ارمنستان', ticketOneWay: 'یک‌طرفه', ticketTagline: 'برای فصل تازه', endLabel: 'پایان', backToTop: 'بازگشت به بالا', footerRole: 'ویدیو و عکاسی',
  },
  hy: {
    available: 'Պատրաստ համագործակցության · 2026', menu: 'Մենյու', close: 'Փակել', soundOn: 'Ձայնը միացված է', soundOff: 'Ձայնն անջատված է', soundLabel: 'Ձայն', languageLabel: 'Լեզու',
    nav: ['Աշխատանքներ', 'Տեսանյութ', 'Իմ մասին', 'Գործընթաց', 'Փաթեթներ', 'Գրառումներ', 'Կապ'], scroll: 'Ոլորեք՝ բացահայտելու համար',
    heroKicker: 'Կինեմատոգրաֆիկ տեսանյութեր և գեղարվեստական լուսանկարներ։ Մեկ տեսախցիկ, մեկ հեղինակ, ոչ մի ավելորդ բան։',
    heroCopy: 'Ստեղծում եմ ֆիլմեր, որոնք պահում են ուշադրությունը, և լուսանկարներ, որոնք կանգնեցնում են պահը։ Բրենդներ, երաժշտություն, դիմանկարներ՝ իրենց հարթակին համապատասխան։',
    ticker: ['Կինեմատոգրաֆիկ ֆիլմ', 'Ժամանակակից մոնտաժ', 'Գեղարվեստական լուսանկար', 'Գունային մշակում'],
    sections: ['Ընտրված աշխատանքներ', 'Տեսանյութ 2026', 'Իմ մասին', 'Ինչպես ենք նկարահանում', 'Փաթեթներ', 'Գրառումներ', 'Պատկերասրահ', 'Պատվեր'],
    workPlaceholder: 'Նախագծի կադր — շուտով',
    projectKinds: ['Բրենդային ֆիլմ', 'Խմբագրական', 'Երաժշտական տեսահոլովակ', 'Սպորտային ֆիլմ', 'Դիմանկարներ', 'Միջոցառման վավերագրություն'],
    reelPlaceholder: 'Հիմնական տեսանյութը՝ շուտով', reelLabel: 'Տեսանյութ',
    stats: ['Պատրաստված ֆիլմ', 'Տարի՝ տեսախցիկի հետևում', 'Առաջին տարբերակի միջին ժամկետ', 'Նկարահանման երկիր'], statValues: ['140+', '9 տարի', '48 ժ', '11'],
    aboutHeading: ['Կադրեր, որոնք', 'չեն թարթում'],
    aboutParagraphs: [
      'Բեմադրում, նկարահանում և մոնտաժում եմ։ Ստեղծում եմ կինեմատոգրաֆիկ պատմություններ բրենդների համար, դինամիկ տեսանյութեր հարթակների համար և նույն գունային լեզվով լուսանկարներ։',
      'Փոքր թիմը գիտակցված ընտրություն է. արագ որոշումներ, երկար կադրեր և մարդիկ, որոնք մոռանում են տեսախցիկի մասին։ Գույնն ու ձայնը ավարտում եմ նույն տեղում, որպեսզի վերջնական արդյունքը լինի այն, ինչ հաստատել եք։',
    ],
    skills: ['Ռեժիսուրա', 'Օպերատորական աշխատանք', 'Մոնտաժ', 'Դիմանկար', 'Գունային մշակում', 'Ձայնային ձևավորում'], portraitCaption: 'Ոսպնյակի երկու կողմում',
    steps: [
      { title: 'Քննարկում', body: 'Զրույց, օրինակներ և նախագծի գլխավոր նպատակը։ Դրանից հետո՝ հստակ առաջարկ և գին։' },
      { title: 'Նախապատրաստում', body: 'Ընտրվում են վայրերը, կազմվում են կադրերի ցանկն ու լուսավորման պլանը։' },
      { title: 'Նկարահանում', body: 'Մեկ օպերատոր, բնական ուղղորդում և երկար կադրեր։ Լուսանկարներն արվում են նույն միջավայրում։' },
      { title: 'Ավարտ', body: 'Մոնտաժը, գույնն ու ձայնը մշակվում են միասին։ Ներառված է մեկ փուլ փոփոխություն և անհրաժեշտ բոլոր ձևաչափերը։' },
    ],
    frame: 'Կադր', scrub: 'Տեսարան · դիտում', plansNote: 'Նվազագույնը՝ կես օր · ճանապարհածախսն առանձին',
    plans: [
      { tag: 'Կես օր', name: 'Մեկնարկ', price: 'Սկսած 850-ից', items: ['4 ժամ տեղում', 'Մեկ 30–60 վայրկյանանոց հոլովակ', '15 մշակված լուսանկար', 'Ուղղահայաց տարբերակ'] },
      { tag: 'Ամբողջ օր', name: 'Արշավ', price: 'Սկսած 2 400-ից', items: ['10 ժամ, մեկ վայրի փոփոխություն', 'Մինչև 2 րոպեանոց հիմնական ֆիլմ', '3 հոլովակ սոցիալական ցանցերի համար', '40 մշակված լուսանկար', '12 ամսվա օգտագործման իրավունք'] },
      { tag: 'Շարունակական', name: 'Ամսական', price: 'Սկսած 3 900-ից / ամիս', items: ['Ամսական երկու նկարահանման օր', 'Ամսական 8 մոնտաժ', 'Լուսանկարների աճող արխիվ', 'Առաջնահերթ հանձնում'] },
    ],
    bookThis: 'Ամրագրել',
    postTitles: ['Ինչպես ստանալ ֆիլմային պատկեր առանց լուսավոր հատվածները կորցնելու', 'Ինչու եմ դիմանկարները լուսավորում մեկ աղբյուրով և սև անդրադարձիչով', 'Մոնտաժ հոսքի համար. առաջին 1.5 վայրկյանը որոշիչ է'],
    readMinutes: 'րոպե', feedPlaceholder: 'Գրառում', comingSoon: 'շուտով',
    contactHeading: ['Սկսե՞նք', 'նկարել'], nextOpening: 'Հաջորդ ազատ ժամկետը՝ նոյեմբեր 2026', fields: ['Անուն', 'Էլ. փոստ', 'Նախագիծ', 'Ժամկետ'],
    placeholders: ['Ո՞վ է գրում', 'Որտե՞ղ պատասխանել', 'Բրենդային ֆիլմ, դիմանկար, միջոցառում…', 'Մոտավոր ժամկետը բավարար է'],
    prepareEmail: 'Պատրաստել նամակը', emailPrepared: 'Ձեր փոստային ծրագիրը կբացվի պատրաստ նամակով. ուղարկումը հաստատում եք դուք։',
    giftEyebrow: 'Եվս մեկ կադր', giftHeading: ['Նոր վայր։', 'Նույն կրակը։'],
    giftNote: 'Յուրաքանչյուր ճանապարհ արժանի է հիշվող սկզբի։ Քո հայացքը, քաջությունն ու պատմությունը տար քեզ հետ՝ ուր էլ գնաս։',
    giftRoute: 'Այստեղից', giftDestination: 'Դեպի Հայաստան', ticketOneWay: 'Միակողմանի', ticketTagline: 'Նոր գլխի համար', endLabel: 'Ավարտ', backToTop: 'Վերադառնալ սկիզբ', footerRole: 'Տեսանյութ և լուսանկարչություն',
  },
  ru: {
    available: 'Открыт к проектам · 2026', menu: 'Меню', close: 'Закрыть', soundOn: 'Звук включён', soundOff: 'Звук выключен', soundLabel: 'Звук', languageLabel: 'Язык',
    nav: ['Работы', 'Шоурил', 'Обо мне', 'Процесс', 'Пакеты', 'Журнал', 'Контакты'], scroll: 'Листайте дальше',
    heroKicker: 'Кинематографичные видео и художественные фото. Одна камера, один автор, ничего лишнего.',
    heroCopy: 'Снимаю фильмы, которые удерживают внимание, и фотографии, которые останавливают мгновение. Бренды, музыка, портреты — для той площадки, где их увидят.',
    ticker: ['Киноистории', 'Динамичный монтаж', 'Арт-фотография', 'Цветокоррекция'],
    sections: ['Избранные работы', 'Шоурил 2026', 'Обо мне', 'Как мы снимаем', 'Пакеты', 'Журнал', 'Лента', 'Бронирование'],
    workPlaceholder: 'Кадр проекта — скоро',
    projectKinds: ['Бренд-фильм', 'Редакционная съёмка', 'Клип', 'Спортивный ролик', 'Портреты', 'Документальный репортаж'],
    reelPlaceholder: 'Полный шоурил появится скоро', reelLabel: 'Шоурил',
    stats: ['Готовых фильмов', 'Лет за камерой', 'Обычно до первого монтажа', 'Стран съёмки'], statValues: ['140+', '9 лет', '48 ч', '11'],
    aboutHeading: ['Кадры, которые', 'не моргают'],
    aboutParagraphs: [
      'Режиссирую, снимаю и монтирую. Создаю кинематографичные истории для брендов, динамичные ролики для охвата и художественные фотографии в той же цветовой палитре.',
      'Небольшая команда — осознанный выбор: решения принимаются быстрее, дубли длятся дольше, а герой забывает о камере. Цвет и звук довожу до финала сам, чтобы результат совпадал с утверждённым.',
    ],
    skills: ['Режиссура', 'Операторская работа', 'Монтаж', 'Портрет', 'Цветокоррекция', 'Звуковой дизайн'], portraitCaption: 'По обе стороны объектива',
    steps: [
      { title: 'Задача', body: 'Звонок, референсы и главная цель проекта. Затем — концепция и фиксированная стоимость.' },
      { title: 'Подготовка', body: 'Подбираем локации, утверждаем план кадров и схему света. Всё, что можно решить заранее, решаем заранее.' },
      { title: 'Съёмка', body: 'Один оператор, естественная режиссура и длинные дубли. Фото снимаются в тех же декорациях.' },
      { title: 'Финал', body: 'Монтаж, цвет и звук делаются вместе. Один раунд правок включён, итог — во всех нужных форматах.' },
    ],
    frame: 'Кадр', scrub: 'Сцена · просмотр', plansNote: 'Минимум полдня · дорога оплачивается отдельно',
    plans: [
      { tag: 'Полдня', name: 'Сингл', price: 'От 850', items: ['4 часа на площадке', 'Один ролик 30–60 секунд', '15 обработанных фото', 'Вертикальная версия'] },
      { tag: 'Полный день', name: 'Кампания', price: 'От 2 400', items: ['10 часов, одна смена локации', 'Главный фильм до 2 минут', '3 ролика для соцсетей', '40 обработанных фото', 'Лицензия на 12 месяцев'] },
      { tag: 'Постоянно', name: 'Ежемесячно', price: 'От 3 900 / мес.', items: ['Два съёмочных дня в месяц', '8 роликов в месяц', 'Пополняемая фотобиблиотека', 'Приоритетная сдача'] },
    ],
    bookThis: 'Выбрать пакет',
    postTitles: ['Как снять картинку с плёночным характером и сохранить света', 'Почему я снимаю портреты с одним источником света и чёрным флагом', 'Монтаж для ленты: первые 1,5 секунды решают всё'],
    readMinutes: 'мин', feedPlaceholder: 'Пост', comingSoon: 'скоро',
    contactHeading: ['Начнём', 'снимать'], nextOpening: 'Ближайшее окно: ноябрь 2026', fields: ['Имя', 'Почта', 'Проект', 'Даты'],
    placeholders: ['Как к вам обращаться', 'Куда ответить', 'Бренд-фильм, портреты, событие…', 'Примерного периода достаточно'],
    prepareEmail: 'Подготовить письмо', emailPrepared: 'Почтовое приложение откроется с готовым письмом. Отправку подтверждаете вы.',
    giftEyebrow: 'Ещё один кадр', giftHeading: ['Новое место.', 'Тот же огонь.'],
    giftNote: 'Каждое путешествие заслуживает начала, которое хочется помнить. Возьми с собой свой взгляд, смелость и историю — куда бы ты ни отправился.',
    giftRoute: 'Отсюда', giftDestination: 'В Армению', ticketOneWay: 'В один конец', ticketTagline: 'Для новой главы', endLabel: 'Конец', backToTop: 'Наверх', footerRole: 'Видео и фотография',
  },
}
