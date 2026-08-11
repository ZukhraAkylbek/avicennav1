CREATE TABLE public.specialties (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  h1_title text NOT NULL,
  meta_title text,
  meta_description text,
  intro text,
  body text,
  tile_color text NOT NULL DEFAULT 'bg-tile-mint',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.specialties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.specialties TO authenticated;
GRANT ALL ON public.specialties TO service_role;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active specialties" ON public.specialties FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can view all specialties" ON public.specialties FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert specialties" ON public.specialties FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update specialties" ON public.specialties FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete specialties" ON public.specialties FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE TRIGGER specialties_set_updated_at BEFORE UPDATE ON public.specialties FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.specialty_faqs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  specialty_id uuid NOT NULL REFERENCES public.specialties(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.specialty_faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.specialty_faqs TO authenticated;
GRANT ALL ON public.specialty_faqs TO service_role;
ALTER TABLE public.specialty_faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view faqs" ON public.specialty_faqs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert faqs" ON public.specialty_faqs FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update faqs" ON public.specialty_faqs FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete faqs" ON public.specialty_faqs FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE TRIGGER specialty_faqs_set_updated_at BEFORE UPDATE ON public.specialty_faqs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.doctors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  specialty_id uuid REFERENCES public.specialties(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  full_name text NOT NULL,
  job_title text,
  photo_url text,
  bio text,
  experience_years integer,
  education text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.doctors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctors TO authenticated;
GRANT ALL ON public.doctors TO service_role;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active doctors" ON public.doctors FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can view all doctors" ON public.doctors FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert doctors" ON public.doctors FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update doctors" ON public.doctors FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete doctors" ON public.doctors FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE TRIGGER doctors_set_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.specialties (slug, name, h1_title, meta_title, meta_description, intro, body, tile_color, sort_order) VALUES
('urolog', 'Урология', 'Уролог в Бишкеке', 'Уролог в Бишкеке — приём и лечение | Авиценна', 'Приём уролога в Бишкеке: диагностика и лечение простатита, цистита, МКБ. УЗИ, анализы, онлайн-запись. Клиника «Авиценна».', 'Урологи «Авиценны» ведут приём взрослых пациентов ежедневно: от консультации до полного курса лечения.', 'В клинике доступны УЗИ мочевыделительной системы, урофлоуметрия, лабораторная диагностика и малоинвазивные операции. Приём ведут врачи с опытом более 10 лет.', 'bg-tile-lilac', 1),
('gastroenterolog', 'Гастроэнтерология', 'Гастроэнтеролог в Бишкеке', 'Гастроэнтеролог в Бишкеке — консультация | Авиценна', 'Консультация гастроэнтеролога в Бишкеке: гастрит, язва, ГЭРБ, болезни печени. Гастроскопия и анализы в клинике «Авиценна».', 'Гастроэнтерологи «Авиценны» помогают при болях в животе, изжоге, нарушениях пищеварения.', 'Проводим гастроскопию, УЗИ органов брюшной полости, дыхательный тест на Helicobacter pylori и полный спектр анализов.', 'bg-tile-mint', 2),
('kardiolog', 'Кардиология', 'Кардиолог в Бишкеке', 'Кардиолог в Бишкеке — приём и ЭКГ | Авиценна', 'Приём кардиолога в Бишкеке: ЭКГ, ЭхоКГ, холтер, подбор терапии при гипертонии и аритмии. Клиника «Авиценна».', 'Кардиологи ведут пациентов с гипертонией, аритмией, болями в сердце и после инфаркта.', 'Доступны ЭКГ, ЭхоКГ, суточное мониторирование по Холтеру, тредмил-тест и лабораторная кардиопанель.', 'bg-tile-pink', 3),
('nevrolog', 'Неврология', 'Невролог в Бишкеке', 'Невролог в Бишкеке — консультация | Авиценна', 'Приём невролога в Бишкеке: головные боли, головокружение, боли в спине, невропатии. Клиника «Авиценна».', 'Неврологи «Авиценны» занимаются диагностикой и лечением заболеваний нервной системы.', 'В арсенале клиники ЭЭГ, УЗДГ сосудов, блокады и лечебные схемы при мигрени и радикулопатиях.', 'bg-tile-sky', 4),
('ginekolog', 'Гинекология', 'Гинеколог в Бишкеке', 'Гинеколог в Бишкеке — приём и УЗИ | Авиценна', 'Приём гинеколога в Бишкеке: осмотр, УЗИ, ведение беременности, лечение воспалений. Клиника «Авиценна».', 'Гинекологи ведут приём в комфортных условиях, с современным диагностическим оборудованием.', 'Кольпоскопия, УЗИ малого таза, цитология, ведение беременности и малые гинекологические операции.', 'bg-tile-peach', 5),
('travmatolog', 'Травматология', 'Травматолог в Бишкеке — травмпункт 24/7', 'Травматолог в Бишкеке — травмпункт 24/7 | Авиценна', 'Травмпункт «Авиценна» в Бишкеке работает круглосуточно: рентген, гипс, обработка ран, приём травматолога.', 'Круглосуточный травмпункт: помощь при переломах, вывихах, ранах и ушибах без записи.', 'Рентген на месте, наложение гипса и ортезов, ПХО ран, консультация ортопеда-травматолога.', 'bg-tile-sand', 6),
('hirurg', 'Хирургия', 'Хирург в Бишкеке', 'Хирург в Бишкеке — консультация и операции | Авиценна', 'Приём хирурга в Бишкеке: грыжи, лапароскопия, удаление новообразований, стационар. Клиника «Авиценна».', 'Хирурги «Авиценны» проводят как консультации, так и плановые операции с размещением в стационаре.', 'Лапароскопические операции, лечение грыж, проктология, дневной и круглосуточный стационар.', 'bg-tile-cream', 7),
('endokrinolog', 'Эндокринология', 'Эндокринолог в Бишкеке', 'Эндокринолог в Бишкеке — приём | Авиценна', 'Приём эндокринолога в Бишкеке: диабет, щитовидная железа, гормоны, ожирение. Клиника «Авиценна».', 'Эндокринологи помогают при диабете, заболеваниях щитовидной железы и гормональных нарушениях.', 'УЗИ щитовидной железы, гормональные панели, подбор терапии и контроль гликемии.', 'bg-tile-gray', 8),
('pediatr', 'Педиатрия', 'Педиатр в Бишкеке', 'Педиатр в Бишкеке — приём детского врача | Авиценна', 'Приём педиатра в Бишкеке: осмотр ребёнка, вакцинация, анализы, вызов врача на дом. Клиника «Авиценна».', 'Педиатры «Авиценны» наблюдают детей с рождения, приём возможен и на дому.', 'Профилактические осмотры, вакцинация, анализы и консультации узких детских специалистов.', 'bg-tile-mint', 9);

INSERT INTO public.specialty_faqs (specialty_id, question, answer, sort_order)
SELECT s.id, q.question, q.answer, q.sort_order
FROM public.specialties s
JOIN (VALUES
  ('urolog', 'Как записаться к урологу в Бишкеке?', 'Запишитесь онлайн на сайте или позвоните по номеру +996 779 909 009 — приём доступен ежедневно.', 1),
  ('urolog', 'Нужны ли анализы перед приёмом уролога?', 'Нет, анализы можно сдать в клинике в день приёма — врач назначит необходимый минимум.', 2),
  ('gastroenterolog', 'Сколько стоит консультация гастроэнтеролога?', 'Актуальную стоимость приёма уточняйте по телефону +996 779 909 009 или при онлайн-записи.', 1),
  ('gastroenterolog', 'Делаете ли вы гастроскопию?', 'Да, гастроскопия выполняется в клинике, в том числе с седацией по показаниям.', 2),
  ('kardiolog', 'Можно ли сделать ЭКГ в день приёма?', 'Да, ЭКГ и ЭхоКГ выполняются в день обращения по назначению кардиолога.', 1),
  ('travmatolog', 'Травмпункт работает ночью?', 'Да, травмпункт «Авиценна» принимает круглосуточно, без предварительной записи.', 1),
  ('pediatr', 'Врач приезжает на дом?', 'Да, вызов педиатра на дом доступен по Бишкеку — оформите заявку по телефону.', 1)
) AS q(slug, question, answer, sort_order) ON q.slug = s.slug;

INSERT INTO public.doctors (specialty_id, slug, full_name, job_title, bio, experience_years, education, sort_order)
SELECT s.id, d.slug, d.full_name, d.job_title, d.bio, d.experience_years, d.education, d.sort_order
FROM public.specialties s
JOIN (VALUES
  ('urolog', 'aliev-ruslan', 'Алиев Руслан Максатович', 'Врач-уролог, хирург', 'Специализируется на лечении простатита, МКБ и малоинвазивной урологической хирургии.', 14, 'КГМА им. И.К. Ахунбаева, ординатура по урологии', 1),
  ('gastroenterolog', 'sultanova-aida', 'Султанова Аида Жумабековна', 'Врач-гастроэнтеролог', 'Ведёт пациентов с гастритом, ГЭРБ и заболеваниями печени, выполняет гастроскопию.', 11, 'КГМА им. И.К. Ахунбаева, специализация по гастроэнтерологии', 1),
  ('kardiolog', 'osmonov-bektur', 'Осмонов Бектур Асанович', 'Врач-кардиолог, к.м.н.', 'Подбор терапии при гипертонии и аритмии, функциональная диагностика сердца.', 18, 'КРСУ, кандидат медицинских наук', 1)
) AS d(slug_spec, slug, full_name, job_title, bio, experience_years, education, sort_order) ON d.slug_spec = s.slug;