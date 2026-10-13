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
  editTitle: string; editBody: string; editItems: string[]; editCta: string; editQuote: string
  soundPrompt: string; soundPromptCta: string
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
    studioLabel: 'Next stop', studioHeading: ['Next stop: Yerevan.', 'Already in love.'],
    studioBody: 'We fell for Armenia long before booking the ticket — the light on pink tuff, Ararat on the horizon, a city full of makers. IZMAB is bringing its camera to Yerevan, to work with Armenian brands, artists and businesses, and with clients abroad.',
    studioFacts: [['Studio', 'Yerevan · opening soon'], ['Services', 'Film · Photography · Post-production'], ['Working with', 'Armenian brands, artists & businesses'], ['Working languages', 'English · فارسی · Հայերեն · Русский'], ['Also', 'Remote edits for clients worldwide']],
    priceFrom: 'From', perMonth: '/ mo', rateNote: 'Dram at today’s rate · 1 USD = {rate} AMD', currencyLabel: 'Currency',
    editTitle: 'Already have content?', editBody: 'If you have content — video, images, graphics — we can edit it for you: cut, grade, retouch and shape it for the platform it lives on.',
    editItems: ['Video edit', 'Colour grade', 'Photo retouch', 'Motion graphics', 'Social cut-downs'], editCta: 'Send your files', editQuote: 'Quote on request',
    soundPrompt: 'Best with sound', soundPromptCta: 'Turn on',
    creditsTitle: 'Credits',
    credits: [['Directed by', 'IZMAB'], ['Cinematography', 'IZMAB'], ['Edit & colour', 'IZMAB'], ['Sound', 'IZMAB'], ['Languages', 'EN · FA · HY · RU'], ['Filmed in', '11 countries'], ['Next chapter', 'Yerevan, Armenia']],
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
    studioLabel: 'مقصد بعدی', studioHeading: ['مقصد بعدی: ایروان.', 'دلمان از همین حالا آنجاست.'],
    studioBody: 'خیلی قبل از خرید بلیط عاشق ارمنستان شدیم؛ نور روی سنگ‌های صورتی توف، آرارات در افق و شهری پر از آدم‌های خلاق. IZMAB دوربینش را به ایروان می‌برد تا با برندها، هنرمندان و کسب‌وکارهای ارمنستان و مشتریانی از سراسر دنیا کار کند.',
    studioFacts: [['استودیو', 'ایروان · به‌زودی'], ['خدمات', 'فیلم · عکس · پست‌پروداکشن'], ['همکاری با', 'برندها، هنرمندان و کسب‌وکارهای ارمنستان'], ['زبان‌های کاری', 'English · فارسی · Հայերեն · Русский'], ['همچنین', 'تدوین از راه دور برای مشتریان سراسر دنیا']],
    priceFrom: 'از', perMonth: '/ ماه', rateNote: 'درام به نرخ امروز · ۱ دلار = {rate} درام', currencyLabel: 'واحد پول',
    editTitle: 'محتوا دارید؟', editBody: 'اگر محتوا دارید — ویدیو، عکس یا گرافیک — ما برایتان ادیتش می‌کنیم: تدوین، رنگ‌بندی، روتوش و آماده‌سازی برای پلتفرمی که در آن دیده می‌شود.',
    editItems: ['تدوین ویدیو', 'رنگ‌بندی', 'روتوش عکس', 'موشن‌گرافیک', 'نسخه‌های شبکه‌های اجتماعی'], editCta: 'فایل‌هایتان را بفرستید', editQuote: 'قیمت پس از بررسی',
    soundPrompt: 'با صدا بهتر است', soundPromptCta: 'روشن کن',
    creditsTitle: 'تیتراژ',
    credits: [['کارگردان', 'IZMAB'], ['فیلم‌بردار', 'IZMAB'], ['تدوین و رنگ', 'IZMAB'], ['صدا', 'IZMAB'], ['زبان‌ها', 'EN · FA · HY · RU'], ['فیلم‌برداری در', '۱۱ کشور'], ['فصل بعد', 'ایروان، ارمنستان']],
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
    studioLabel: 'Հաջորդ կանգառ', studioHeading: ['Հաջորդ կանգառը՝ Երևան։', 'Արդեն սիրահարված ենք։'],
    studioBody: 'Հայաստանով սիրահարվեցինք տոմս գնելուց շատ առաջ․ լույսը վարդագույն տուֆի վրա, Արարատը հորիզոնում, ստեղծագործողներով լի քաղաք։ IZMAB-ը իր տեսախցիկը բերում է Երևան՝ աշխատելու հայկական բրենդների, արվեստագետների և բիզնեսների, ինչպես նաև արտերկրի հաճախորդների հետ։',
    studioFacts: [['Ստուդիա', 'Երևան · շուտով'], ['Ծառայություններ', 'Տեսանյութ · Լուսանկար · Հետարտադրություն'], ['Համագործակցություն', 'Հայկական բրենդներ, արվեստագետներ և բիզնեսներ'], ['Աշխատանքային լեզուներ', 'English · فارسی · Հայերեն · Русский'], ['Նաև', 'Հեռավար մոնտաժ ամբողջ աշխարհի հաճախորդների համար']],
    priceFrom: 'Սկսած', perMonth: '/ ամիս', rateNote: 'Դրամով՝ այսօրվա փոխարժեքով · 1 USD = {rate} AMD', currencyLabel: 'Արժույթ',
    editTitle: 'Արդեն ունե՞ք նյութ', editBody: 'Եթե ունեք նյութ՝ տեսանյութ, լուսանկար, գրաֆիկա, մենք կխմբագրենք այն ձեզ համար՝ մոնտաժ, գունավորում, ռետուշ և պատրաստում այն հարթակի համար, որտեղ կցուցադրվի։',
    editItems: ['Տեսամոնտաժ', 'Գունային մշակում', 'Լուսանկարի ռետուշ', 'Մոուշն գրաֆիկա', 'Կարճ տարբերակներ սոցցանցերի համար'], editCta: 'Ուղարկեք ֆայլերը', editQuote: 'Գինը՝ ըստ հարցման',
    soundPrompt: 'Ավելի լավ է ձայնով', soundPromptCta: 'Միացնել',
    creditsTitle: 'Տիտրեր',
    credits: [['Ռեժիսոր', 'IZMAB'], ['Օպերատոր', 'IZMAB'], ['Մոնտաժ և գույն', 'IZMAB'], ['Ձայն', 'IZMAB'], ['Լեզուներ', 'EN · FA · HY · RU'], ['Նկարահանված է', '11 երկրում'], ['Հաջորդ գլուխը', 'Երևան, Հայաստան']],
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
    studioLabel: 'Следующая остановка', studioHeading: ['Следующая остановка — Ереван.', 'Мы уже влюблены.'],
    studioBody: 'Мы влюбились в Армению задолго до покупки билета — свет на розовом туфе, Арарат на горизонте, город, полный творцов. IZMAB везёт свою камеру в Ереван, чтобы работать с армянскими брендами, артистами и компаниями, а также с клиентами из-за рубежа.',
    studioFacts: [['Студия', 'Ереван · скоро'], ['Услуги', 'Видео · Фото · Постпродакшн'], ['Работаем с', 'армянскими брендами, артистами и бизнесом'], ['Рабочие языки', 'English · فارسی · Հայերեն · Русский'], ['А также', 'Удалённый монтаж для клиентов по всему миру']],
    priceFrom: 'От', perMonth: '/ мес.', rateNote: 'В драмах по курсу на сегодня · 1 USD = {rate} AMD', currencyLabel: 'Валюта',
    editTitle: 'Уже есть материал?', editBody: 'Если у вас есть контент — видео, фото, графика — мы его смонтируем: монтаж, цвет, ретушь и подготовка под площадку, где его увидят.',
    editItems: ['Монтаж видео', 'Цветокоррекция', 'Ретушь фото', 'Моушн-графика', 'Нарезки для соцсетей'], editCta: 'Отправить файлы', editQuote: 'Цена по запросу',
    soundPrompt: 'Лучше со звуком', soundPromptCta: 'Включить',
    creditsTitle: 'Титры',
    credits: [['Режиссёр', 'IZMAB'], ['Оператор', 'IZMAB'], ['Монтаж и цвет', 'IZMAB'], ['Звук', 'IZMAB'], ['Языки', 'EN · FA · HY · RU'], ['Снято в', '11 странах'], ['Следующая глава', 'Ереван, Армения']],
    heroLine: ['Кадры, которые', 'остаются.'],
    chapters: ['Начало', 'Манифест', 'Работы', 'Шоурил', 'Обо мне', 'Процесс', 'Пакеты', 'Журнал', 'Контакты', 'Отъезд', 'Титры'],
  },
}
