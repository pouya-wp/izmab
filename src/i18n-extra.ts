import type { Language } from './i18n'

export interface ExtraText {
  loading: string; skip: string
  manifesto: string; manifestoAccent: string[]
  workHint: string; teaser: string
  gradeHint: string; gradeLabel: string
  apertureLabel: string
  slate: { prod: string; roll: string; scene: string; take: string }
  sheetLabel: string; sheetNote: string
  localTime: string; copy: string; copied: string; studio: string
  studioLabel: string; studioHeading: [string, string]; studioBody: string; studioFacts: [string, string][]
  priceFrom: string; perMonth: string; rateNote: string; currencyLabel: string
  credits: [string, string][]; creditsTitle: string
  heroLine: [string, string]
  chapters: string[]
}

export const extra: Record<Language, ExtraText> = {
  en: {
    loading: 'Loading reel', skip: 'Skip',
    manifesto: 'One camera. One operator. No filler. Every frame earns its place — cut for the screen it lives on, graded like it is going to a cinema.',
    manifestoAccent: ['camera.', 'frame', 'cinema.'],
    workHint: 'Scroll to cut between projects', teaser: 'Teaser cut',
    gradeHint: 'Drag to compare LOG with the grade', gradeLabel: 'Colour grade',
    apertureLabel: 'Aperture',
    slate: { prod: 'Prod.', roll: 'Roll', scene: 'Scene', take: 'Take' },
    sheetLabel: 'Contact sheet', sheetNote: 'Feed coming soon',
    localTime: 'Local time · Yerevan', copy: 'Copy', copied: 'Copied', studio: 'Studio',
    studioLabel: 'Studio', studioHeading: ['Based in Yerevan.', 'Working everywhere.'],
    studioBody: 'IZMAB is a registered company in the Republic of Armenia. From our studio in Yerevan we film and photograph across Armenia and travel for projects abroad — contracts and invoicing in dram or dollars.',
    studioFacts: [['Registered company', 'Republic of Armenia'], ['Studio', 'Yerevan, Armenia'], ['Services', 'Film · Photography · Post-production'], ['Working languages', 'English · فارسی · Հայերեն · Русский'], ['Invoicing', 'AMD · USD']],
    priceFrom: 'From', perMonth: '/ mo', rateNote: 'Dram at today’s rate · 1 USD = {rate} AMD', currencyLabel: 'Currency',
    creditsTitle: 'Credits',
    credits: [['Directed by', 'IZMAB'], ['Cinematography', 'IZMAB'], ['Edit & colour', 'IZMAB'], ['Sound', 'IZMAB'], ['Languages', 'EN · FA · HY · RU'], ['Filmed in', '11 countries'], ['Based in', 'Yerevan, Armenia']],
    heroLine: ['Frames that', 'hold still.'],
    chapters: ['Opening', 'Manifesto', 'Work', 'Reel', 'About', 'Process', 'Packages', 'Journal', 'Contact', 'Departure', 'Credits'],
  },
  fa: {
    loading: 'در حال بارگذاری', skip: 'رد شدن',
    manifesto: 'یک دوربین. یک نگاه. بدون اضافه. هر قاب جایش را به‌دست می‌آورد — برای صفحه‌ای که در آن دیده می‌شود تدوین می‌شود و طوری رنگ می‌گیرد که انگار برای سینما ساخته شده.',
    manifestoAccent: ['دوربین.', 'قاب', 'سینما'],
    workHint: 'برای جابه‌جایی بین پروژه‌ها اسکرول کن', teaser: 'تیزر',
    gradeHint: 'بکش تا LOG را با رنگ‌بندی نهایی مقایسه کنی', gradeLabel: 'رنگ‌بندی',
    apertureLabel: 'دیافراگم',
    slate: { prod: 'تولید', roll: 'رول', scene: 'صحنه', take: 'برداشت' },
    sheetLabel: 'کانتکت‌شیت', sheetNote: 'گالری به‌زودی',
    localTime: 'ساعت محلی · ایروان', copy: 'کپی', copied: 'کپی شد', studio: 'استودیو',
    studioLabel: 'استودیو', studioHeading: ['مستقر در ایروان.', 'فعال در همه‌جا.'],
    studioBody: 'IZMAB شرکتی ثبت‌شده در جمهوری ارمنستان است. از استودیومان در ایروان در سراسر ارمنستان فیلم‌برداری و عکاسی می‌کنیم و برای پروژه‌های خارج از کشور سفر می‌کنیم — قرارداد و صورت‌حساب به درام یا دلار.',
    studioFacts: [['شرکت ثبت‌شده', 'جمهوری ارمنستان'], ['استودیو', 'ایروان، ارمنستان'], ['خدمات', 'فیلم · عکس · پست‌پروداکشن'], ['زبان‌های کاری', 'English · فارسی · Հայերեն · Русский'], ['صورت‌حساب', 'AMD · USD']],
    priceFrom: 'از', perMonth: '/ ماه', rateNote: 'درام به نرخ امروز · ۱ دلار = {rate} درام', currencyLabel: 'واحد پول',
    creditsTitle: 'تیتراژ',
    credits: [['کارگردان', 'IZMAB'], ['فیلم‌بردار', 'IZMAB'], ['تدوین و رنگ', 'IZMAB'], ['صدا', 'IZMAB'], ['زبان‌ها', 'EN · FA · HY · RU'], ['فیلم‌برداری در', '۱۱ کشور'], ['مستقر در', 'ایروان، ارمنستان']],
    heroLine: ['قاب‌هایی که', 'می‌مانند.'],
    chapters: ['آغاز', 'بیانیه', 'آثار', 'شوریل', 'درباره', 'روند', 'پکیج‌ها', 'یادداشت‌ها', 'تماس', 'سفر', 'تیتراژ'],
  },
  hy: {
    loading: 'Բեռնվում է', skip: 'Բաց թողնել',
    manifesto: 'Մեկ տեսախցիկ։ Մեկ հեղինակ։ Ոչ մի ավելորդ բան։ Յուրաքանչյուր կադր վաստակում է իր տեղը՝ մոնտաժված իր էկրանի համար և գունավորված այնպես, կարծես կինոթատրոնի համար է։',
    manifestoAccent: ['տեսախցիկ։', 'կադր', 'կինոթատրոնի'],
    workHint: 'Ոլորեք՝ նախագծերի միջև անցնելու համար', teaser: 'Թիզեր',
    gradeHint: 'Քաշեք՝ LOG-ը գունավորման հետ համեմատելու համար', gradeLabel: 'Գունային մշակում',
    apertureLabel: 'Դիաֆրագմա',
    slate: { prod: 'Արտ.', roll: 'Ժապավեն', scene: 'Տեսարան', take: 'Դուբլ' },
    sheetLabel: 'Կոնտակտային թերթ', sheetNote: 'Պատկերասրահը՝ շուտով',
    localTime: 'Տեղական ժամ · Երևան', copy: 'Պատճենել', copied: 'Պատճենված է', studio: 'Ստուդիա',
    studioLabel: 'Ստուդիա', studioHeading: ['Հիմնված ենք Երևանում։', 'Աշխատում ենք ամենուր։'],
    studioBody: 'IZMAB-ը Հայաստանի Հանրապետությունում գրանցված ընկերություն է։ Երևանի մեր ստուդիայից նկարահանում ենք ամբողջ Հայաստանում և մեկնում ենք արտերկրյա նախագծերի համար․ պայմանագրեր և հաշիվներ՝ դրամով կամ դոլարով։',
    studioFacts: [['Գրանցված ընկերություն', 'Հայաստանի Հանրապետություն'], ['Ստուդիա', 'Երևան, Հայաստան'], ['Ծառայություններ', 'Տեսանյութ · Լուսանկար · Հետարտադրություն'], ['Աշխատանքային լեզուներ', 'English · فارسی · Հայերեն · Русский'], ['Հաշիվներ', 'AMD · USD']],
    priceFrom: 'Սկսած', perMonth: '/ ամիս', rateNote: 'Դրամով՝ այսօրվա փոխարժեքով · 1 USD = {rate} AMD', currencyLabel: 'Արժույթ',
    creditsTitle: 'Տիտրեր',
    credits: [['Ռեժիսոր', 'IZMAB'], ['Օպերատոր', 'IZMAB'], ['Մոնտաժ և գույն', 'IZMAB'], ['Ձայն', 'IZMAB'], ['Լեզուներ', 'EN · FA · HY · RU'], ['Նկարահանված է', '11 երկրում'], ['Հիմնված է', 'Երևան, Հայաստան']],
    heroLine: ['Կադրեր, որոնք', 'մնում են։'],
    chapters: ['Սկիզբ', 'Մանիֆեստ', 'Աշխատանքներ', 'Տեսանյութ', 'Իմ մասին', 'Գործընթաց', 'Փաթեթներ', 'Գրառումներ', 'Կապ', 'Մեկնում', 'Տիտրեր'],
  },
  ru: {
    loading: 'Загрузка плёнки', skip: 'Пропустить',
    manifesto: 'Одна камера. Один автор. Ничего лишнего. Каждый кадр заслуживает своё место — смонтирован для экрана, на котором живёт, и выкрашен так, будто идёт в кинотеатр.',
    manifestoAccent: ['камера.', 'кадр', 'кинотеатр.'],
    workHint: 'Листайте, чтобы переключать проекты', teaser: 'Тизер',
    gradeHint: 'Потяните, чтобы сравнить LOG и грейд', gradeLabel: 'Цветокоррекция',
    apertureLabel: 'Диафрагма',
    slate: { prod: 'Прод.', roll: 'Ролл', scene: 'Сцена', take: 'Дубль' },
    sheetLabel: 'Контактный лист', sheetNote: 'Лента скоро',
    localTime: 'Местное время · Ереван', copy: 'Копировать', copied: 'Скопировано', studio: 'Студия',
    studioLabel: 'Студия', studioHeading: ['Базируемся в Ереване.', 'Работаем везде.'],
    studioBody: 'IZMAB — компания, зарегистрированная в Республике Армения. Из студии в Ереване мы снимаем видео и фото по всей Армении и выезжаем на проекты за рубеж — договор и счета в драмах или долларах.',
    studioFacts: [['Зарегистрированная компания', 'Республика Армения'], ['Студия', 'Ереван, Армения'], ['Услуги', 'Видео · Фото · Постпродакшн'], ['Рабочие языки', 'English · فارسی · Հայերեն · Русский'], ['Оплата', 'AMD · USD']],
    priceFrom: 'От', perMonth: '/ мес.', rateNote: 'В драмах по курсу на сегодня · 1 USD = {rate} AMD', currencyLabel: 'Валюта',
    creditsTitle: 'Титры',
    credits: [['Режиссёр', 'IZMAB'], ['Оператор', 'IZMAB'], ['Монтаж и цвет', 'IZMAB'], ['Звук', 'IZMAB'], ['Языки', 'EN · FA · HY · RU'], ['Снято в', '11 странах'], ['Базируемся в', 'Ереване, Армения']],
    heroLine: ['Кадры, которые', 'остаются.'],
    chapters: ['Начало', 'Манифест', 'Работы', 'Шоурил', 'Обо мне', 'Процесс', 'Пакеты', 'Журнал', 'Контакты', 'Отъезд', 'Титры'],
  },
}
