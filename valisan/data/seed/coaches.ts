import type { Coach } from '@/domain/types';

export const COACHES: Coach[] = [
  {
    id: 'c1', userId: 'u_coach1', slug: 'sara-mohammadi', displayName: 'سارا محمدی', title: 'مربی ارشد پیلاتس ریفرمر',
    bio: 'سارا بیش از یازده سال است که پیلاتس را با رویکردی دقیق و آرام آموزش می‌دهد. تمرکز او بر هم‌راستایی ستون فقرات، تنفس آگاهانه و ساختن قدرت از مرکز بدن است. کلاس‌های او برای بانوانی طراحی شده که به دنبال نتیجه‌ای ماندگار و بی‌سروصدا هستند.',
    quote: 'قدرت واقعی از سکوتِ مرکز بدن آغاز می‌شود.',
    modalities: ['pilates_reformer', 'corrective', 'strength'],
    certifications: [
      { title: 'STOTT Pilates® Reformer Level 2', issuer: 'Merrithew', year: 2018 },
      { title: 'Polestar Pilates Rehabilitation', issuer: 'Polestar', year: 2021 },
      { title: 'کارشناسی ارشد فیزیولوژی ورزشی', issuer: 'دانشگاه تهران', year: 2016 },
    ],
    studioHours: [
      { weekday: 0, windows: [{ start: '09:00', end: '13:00' }], sessionType: 'semi_private', modality: 'pilates_reformer', room: 'استودیو ریفرمر' },
      { weekday: 2, windows: [{ start: '09:00', end: '13:00' }], sessionType: 'semi_private', modality: 'pilates_reformer', room: 'استودیو ریفرمر' },
      { weekday: 4, windows: [{ start: '09:00', end: '13:00' }], sessionType: 'semi_private', modality: 'pilates_reformer', room: 'استودیو ریفرمر' },
      { weekday: 1, windows: [{ start: '16:00', end: '20:00' }], sessionType: 'semi_private', modality: 'pilates_reformer', room: 'استودیو ریفرمر' },
      { weekday: 3, windows: [{ start: '16:00', end: '20:00' }], sessionType: 'private', modality: 'corrective', room: 'اتاق خصوصی' },
      { weekday: 5, windows: [{ start: '10:00', end: '13:00' }], sessionType: 'semi_private', modality: 'pilates_reformer', room: 'استودیو ریفرمر' },
    ],
    capacity: { private: 1, semi_private: 3, group: 6 }, rating: 4.9, yearsExperience: 11, isAcceptingNewClients: true, accent: '300',
  },
  {
    id: 'c2', userId: 'u_coach2', slug: 'niloufar-rahimi', displayName: 'نیلوفر رحیمی', title: 'مربی پیلاتس مت و حرکات اصلاحی',
    bio: 'نیلوفر با پیشینه فیزیوتراپی، کلاس‌های مت و حرکات اصلاحی را برای بانوانی برگزار می‌کند که ساعت‌های طولانی پشت میز می‌نشینند. روش او ترکیبی از ارزیابی دقیق وضعیت بدنی و تمرین‌های کوچک اما اثرگذار است.',
    quote: 'هر روز، یک درجه نزدیک‌تر به تعادل.',
    modalities: ['pilates_mat', 'corrective', 'mobility'],
    certifications: [
      { title: 'Corrective Exercise Specialist (CES)', issuer: 'NASM', year: 2019 },
      { title: 'BASI Pilates Mat', issuer: 'BASI', year: 2017 },
    ],
    studioHours: [
      { weekday: 0, windows: [{ start: '17:00', end: '20:00' }], sessionType: 'group', modality: 'pilates_mat', room: 'استودیو مت' },
      { weekday: 1, windows: [{ start: '10:00', end: '12:00' }], sessionType: 'private', modality: 'corrective', room: 'اتاق خصوصی' },
      { weekday: 2, windows: [{ start: '17:00', end: '20:00' }], sessionType: 'group', modality: 'pilates_mat', room: 'استودیو مت' },
      { weekday: 3, windows: [{ start: '10:00', end: '12:00' }], sessionType: 'private', modality: 'corrective', room: 'اتاق خصوصی' },
      { weekday: 4, windows: [{ start: '17:00', end: '20:00' }], sessionType: 'group', modality: 'pilates_mat', room: 'استودیو مت' },
      { weekday: 5, windows: [{ start: '17:00', end: '19:00' }], sessionType: 'group', modality: 'mobility', room: 'استودیو مت' },
    ],
    capacity: { private: 1, semi_private: 3, group: 6 }, rating: 4.8, yearsExperience: 8, isAcceptingNewClients: true, accent: '280',
  },
  {
    id: 'c3', userId: 'u_coach3', slug: 'mahsa-karimi', displayName: 'مهسا کریمی', title: 'مربی هاتا و وینیاسا یوگا',
    bio: 'مهسا یوگا را در ریشیکش آموخته و آن را با زبانی ساده و بی‌تکلف به بانوان ایرانی منتقل می‌کند. کلاس‌های او با تمرکز بر تنفس، سکون و جریان، فضایی امن برای رهاکردن ذهن می‌سازد.',
    quote: 'نفس بکش؛ بقیه‌اش خودش می‌آید.',
    modalities: ['yoga_hatha', 'yoga_vinyasa', 'mobility'],
    certifications: [
      { title: 'RYT-500', issuer: 'Yoga Alliance', year: 2020 },
      { title: 'Yin Yoga & Meditation', issuer: 'Rishikesh Yog Peeth', year: 2018 },
    ],
    studioHours: [
      { weekday: 1, windows: [{ start: '08:00', end: '11:00' }], sessionType: 'group', modality: 'yoga_hatha', room: 'لافت یوگا' },
      { weekday: 3, windows: [{ start: '08:00', end: '11:00' }], sessionType: 'group', modality: 'yoga_vinyasa', room: 'لافت یوگا' },
      { weekday: 5, windows: [{ start: '08:00', end: '11:00' }], sessionType: 'group', modality: 'yoga_hatha', room: 'لافت یوگا' },
      { weekday: 0, windows: [{ start: '18:00', end: '20:00' }], sessionType: 'group', modality: 'yoga_vinyasa', room: 'لافت یوگا' },
      { weekday: 2, windows: [{ start: '18:00', end: '20:00' }], sessionType: 'group', modality: 'yoga_hatha', room: 'لافت یوگا' },
    ],
    capacity: { private: 1, semi_private: 3, group: 6 }, rating: 5.0, yearsExperience: 9, isAcceptingNewClients: true, accent: '320',
  },
  {
    id: 'c4', userId: 'u_coach4', slug: 'elham-sadeghi', displayName: 'الهام صادقی', title: 'متخصص بازتوانی پس از زایمان و موبیلیتی',
    bio: 'الهام با مادران در دوره‌ی پس از زایمان همراه می‌شود؛ از بازسازی کف لگن و عضلات مرکزی تا بازگشت تدریجی به قدرت. جلسات او خصوصی و کاملاً شخصی‌سازی‌شده است.',
    quote: 'بدن شما داستان بزرگی را پشت سر گذاشته؛ با احترام از آن مراقبت می‌کنیم.',
    modalities: ['postpartum', 'mobility', 'strength'],
    certifications: [
      { title: 'Pre & Postnatal Specialist', issuer: 'Girls Gone Strong', year: 2021 },
      { title: 'Pelvic Floor Rehabilitation', issuer: 'APPI', year: 2022 },
    ],
    studioHours: [
      { weekday: 0, windows: [{ start: '11:00', end: '14:00' }], sessionType: 'private', modality: 'postpartum', room: 'اتاق خصوصی' },
      { weekday: 1, windows: [{ start: '11:00', end: '14:00' }], sessionType: 'private', modality: 'postpartum', room: 'اتاق خصوصی' },
      { weekday: 2, windows: [{ start: '11:00', end: '14:00' }], sessionType: 'private', modality: 'postpartum', room: 'اتاق خصوصی' },
      { weekday: 3, windows: [{ start: '11:00', end: '14:00' }], sessionType: 'private', modality: 'strength', room: 'اتاق خصوصی' },
      { weekday: 4, windows: [{ start: '11:00', end: '14:00' }], sessionType: 'private', modality: 'postpartum', room: 'اتاق خصوصی' },
      { weekday: 5, windows: [{ start: '09:00', end: '12:00' }], sessionType: 'semi_private', modality: 'mobility', room: 'استودیو مت' },
    ],
    capacity: { private: 1, semi_private: 3, group: 6 }, rating: 4.9, yearsExperience: 7, isAcceptingNewClients: false, accent: '255',
  },
];
