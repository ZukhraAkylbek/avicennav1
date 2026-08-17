CREATE TABLE public.diagnostics_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  body text,
  image_url text,
  primary_label text,
  primary_url text,
  secondary_label text,
  secondary_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnostics_sections TO authenticated;
GRANT SELECT ON public.diagnostics_sections TO anon;
GRANT ALL ON public.diagnostics_sections TO service_role;
ALTER TABLE public.diagnostics_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active diagnostics sections" ON public.diagnostics_sections FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can view all diagnostics sections" ON public.diagnostics_sections FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert diagnostics sections" ON public.diagnostics_sections FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update diagnostics sections" ON public.diagnostics_sections FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete diagnostics sections" ON public.diagnostics_sections FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER diagnostics_sections_set_updated_at BEFORE UPDATE ON public.diagnostics_sections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.diagnostics_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnostics_categories TO authenticated;
GRANT SELECT ON public.diagnostics_categories TO anon;
GRANT ALL ON public.diagnostics_categories TO service_role;
ALTER TABLE public.diagnostics_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active diagnostics categories" ON public.diagnostics_categories FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can view all diagnostics categories" ON public.diagnostics_categories FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert diagnostics categories" ON public.diagnostics_categories FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update diagnostics categories" ON public.diagnostics_categories FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete diagnostics categories" ON public.diagnostics_categories FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER diagnostics_categories_set_updated_at BEFORE UPDATE ON public.diagnostics_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.diagnostics_symptoms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  recommendation text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnostics_symptoms TO authenticated;
GRANT SELECT ON public.diagnostics_symptoms TO anon;
GRANT ALL ON public.diagnostics_symptoms TO service_role;
ALTER TABLE public.diagnostics_symptoms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active diagnostics symptoms" ON public.diagnostics_symptoms FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can view all diagnostics symptoms" ON public.diagnostics_symptoms FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert diagnostics symptoms" ON public.diagnostics_symptoms FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update diagnostics symptoms" ON public.diagnostics_symptoms FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete diagnostics symptoms" ON public.diagnostics_symptoms FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER diagnostics_symptoms_set_updated_at BEFORE UPDATE ON public.diagnostics_symptoms FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.diagnostics_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  category_key text,
  icon text,
  image_url text,
  price text,
  badge text,
  body text,
  includes text,
  preparation text,
  meta_title text,
  meta_description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnostics_items TO authenticated;
GRANT SELECT ON public.diagnostics_items TO anon;
GRANT ALL ON public.diagnostics_items TO service_role;
ALTER TABLE public.diagnostics_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active diagnostics items" ON public.diagnostics_items FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can view all diagnostics items" ON public.diagnostics_items FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert diagnostics items" ON public.diagnostics_items FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update diagnostics items" ON public.diagnostics_items FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete diagnostics items" ON public.diagnostics_items FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER diagnostics_items_set_updated_at BEFORE UPDATE ON public.diagnostics_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.diagnostics_sections (key, title, subtitle, body, primary_label, primary_url, secondary_label, secondary_url, sort_order) VALUES
('hero', 'Диагностика в Бишкеке', 'Современное оборудование экспертного класса и опытные врачи. Точные результаты, быстрое заключение и комфорт на каждом этапе.', NULL, 'Записаться на диагностику', 'https://n1272322.alteg.io/', 'Узнать стоимость', '/kontakty', 1),
('navigator', 'Какой у вас симптом?', 'Выберите симптом — мы подберём подходящие исследования', 'Данный навигатор носит информационный характер и не заменяет консультацию врача. Окончательный выбор исследований определяет специалист.', NULL, NULL, NULL, NULL, 2),
('catalog', 'Направления диагностики', 'Более 24 видов исследований: лучевая и функциональная диагностика, УЗИ, лаборатория и эндоскопия.', NULL, NULL, NULL, NULL, NULL, 3),
('advantages', 'Преимущества диагностики', 'Аппараты экспертного класса, заключение в день исследования, врачи с опытом от 10 лет и забота о каждом пациенте.', NULL, NULL, NULL, NULL, NULL, 4),
('cta', 'Не знаете, какое исследование нужно?', 'Позвоните нам — врач подберёт нужное обследование и подскажет, как подготовиться.', NULL, 'Записаться онлайн', 'https://n1272322.alteg.io/', NULL, NULL, 5);

INSERT INTO public.diagnostics_categories (key, name, sort_order) VALUES
('luchevaya', 'Лучевая диагностика', 1),
('uzi', 'УЗИ', 2),
('lab', 'Лабораторная диагностика', 3),
('funkc', 'Функциональная диагностика', 4),
('endo', 'Эндоскопия', 5);

INSERT INTO public.diagnostics_symptoms (name, recommendation, sort_order) VALUES
('Боли в животе', 'рекомендуем: УЗИ брюшной полости, ФГДС, лабораторные анализы.', 1),
('Головные боли', 'рекомендуем: МРТ головного мозга, УЗДГ сосудов шеи, анализы крови.', 2),
('Одышка', 'рекомендуем: УЗИ сердца, ЭКГ, спирометрию, лабораторные анализы.', 3),
('Учащённый пульс', 'рекомендуем: ЭКГ, холтеровское мониторирование, УЗИ сердца.', 4),
('Боли в груди', 'рекомендуем: ЭКГ, УЗИ сердца, рентген органов грудной клетки.', 5),
('Слабость и усталость', 'рекомендуем: общий и биохимический анализ крови, гормоны щитовидной железы.', 6),
('Повышенное давление', 'рекомендуем: ЭКГ, УЗИ сердца и почек, суточное мониторирование давления.', 7),
('Боли в суставах', 'рекомендуем: рентген суставов, УЗИ суставов, МРТ, анализы на воспаление.', 8),
('Кашель', 'рекомендуем: рентген органов грудной клетки, спирометрию, анализы крови.', 9),
('Проблемы со сном', 'рекомендуем: ЭКГ, гормональные исследования, УЗДГ сосудов головы и шеи.', 10),
('Тошнота', 'рекомендуем: ФГДС, УЗИ брюшной полости, лабораторные анализы.', 11),
('Отёки', 'рекомендуем: УЗИ почек, УЗИ вен нижних конечностей, анализы крови и мочи.', 12),
('Головокружение', 'рекомендуем: МРТ головного мозга, УЗДГ сосудов шеи, ЭКГ.', 13),
('Боли в пояснице', 'рекомендуем: МРТ позвоночника, рентген, УЗИ почек.', 14),
('Нарушение зрения', 'рекомендуем: МРТ головного мозга, консультацию офтальмолога, анализы крови.', 15),
('Онемение конечностей', 'рекомендуем: МРТ позвоночника, УЗДГ сосудов конечностей, анализы крови.', 16);

INSERT INTO public.diagnostics_items (slug, title, subtitle, category_key, icon, price, badge, body, includes, preparation, sort_order) VALUES
('kt', 'Компьютерная томография (КТ)', 'Послойное исследование органов и костей с высокой точностью', 'luchevaya', 'Scan', 'от 3500 сом', 'Экспертный класс', 'КТ позволяет получить детальные послойные изображения органов, костей и сосудов. Исследование занимает несколько минут, заключение выдаём в день обращения.', 'КТ головного мозга, КТ грудной клетки, КТ позвоночника, КТ брюшной полости', 'За 4 часа до исследования не принимать пищу при исследовании с контрастом.', 1),
('mrt', 'Магнитно-резонансная томография (МРТ)', 'Безопасное исследование без облучения', 'luchevaya', 'ScanLine', 'от 4500 сом', NULL, 'МРТ — золотой стандарт диагностики мягких тканей, головного мозга, позвоночника и суставов.', 'МРТ головного мозга, МРТ позвоночника, МРТ суставов', 'Снимите металлические предметы. Сообщите врачу о кардиостимуляторе.', 2),
('rentgen', 'Рентген', 'Быстрая диагностика костей и органов грудной клетки', 'luchevaya', 'Bone', 'от 700 сом', NULL, 'Цифровой рентген с минимальной дозой облучения и мгновенным результатом.', 'Рентген органов грудной клетки, рентген костей и суставов, рентген пазух носа', 'Специальная подготовка не требуется.', 3),
('mammografiya', 'Маммография', 'Скрининг здоровья молочных желёз', 'luchevaya', 'Ribbon', 'от 1200 сом', 'Скрининг', 'Маммография помогает выявить изменения на самой ранней стадии. Рекомендована женщинам после 40 лет ежегодно.', 'Обзорная маммография, прицельные снимки', 'Лучшее время — 5–12 день цикла.', 4),
('flyuorografiya', 'Флюорография', 'Профилактическое исследование лёгких', 'luchevaya', 'Wind', 'от 500 сом', NULL, 'Быстрое профилактическое исследование лёгких, справка в день обращения.', 'Цифровая флюорография', 'Подготовка не требуется.', 5),
('densitometriya', 'Денситометрия', 'Оценка плотности костной ткани', 'luchevaya', 'Bone', 'от 1800 сом', NULL, 'Исследование выявляет остеопороз до первых переломов.', 'Денситометрия позвоночника и бедра', 'Подготовка не требуется.', 6),
('uzi-bryushnoy-polosti', 'УЗИ брюшной полости', 'Печень, желчный пузырь, поджелудочная, селезёнка', 'uzi', 'Waves', 'от 1200 сом', NULL, 'Комплексное УЗИ органов брюшной полости на аппарате экспертного класса.', 'Печень, желчный пузырь, поджелудочная железа, селезёнка', 'Натощак, за 6–8 часов до исследования не есть.', 7),
('uzi-serdca', 'УЗИ сердца (ЭхоКГ)', 'Оценка работы сердца и клапанов', 'uzi', 'HeartPulse', 'от 1800 сом', NULL, 'Эхокардиография показывает структуру сердца, работу клапанов и сократимость миокарда.', 'ЭхоКГ с допплерографией', 'Подготовка не требуется.', 8),
('uzi-shchitovidnoy', 'УЗИ щитовидной железы', 'Узлы, объём и структура железы', 'uzi', 'Activity', 'от 900 сом', NULL, 'Исследование выявляет узлы, кисты и изменения структуры щитовидной железы.', 'УЗИ щитовидной железы и лимфоузлов шеи', 'Подготовка не требуется.', 9),
('uzi-pochek', 'УЗИ почек и мочевого пузыря', 'Диагностика мочевыделительной системы', 'uzi', 'Droplets', 'от 1000 сом', NULL, 'Помогает выявить камни, воспаление и структурные изменения почек.', 'УЗИ почек, мочевого пузыря, надпочечников', 'За час до исследования выпейте 500 мл воды.', 10),
('uzi-ginekologiya', 'УЗИ в гинекологии', 'Матка, яичники, контроль беременности', 'uzi', 'Baby', 'от 1200 сом', NULL, 'Гинекологическое УЗИ и ведение беременности на всех сроках.', 'Трансвагинальное УЗИ, УЗИ плода, фолликулометрия', 'Уточните подготовку у администратора.', 11),
('uzi-detyam', 'УЗИ детям', 'Бережная диагностика с первых дней жизни', 'uzi', 'Baby', 'от 1000 сом', 'Для детей', 'Детские УЗИ проводят врачи с опытом работы с малышами.', 'Нейросонография, УЗИ тазобедренных суставов, УЗИ органов', 'Уточните подготовку у администратора.', 12),
('uzdg-sosudov', 'УЗДГ сосудов', 'Кровоток в сосудах головы, шеи и конечностей', 'uzi', 'Activity', 'от 1500 сом', NULL, 'Допплерография показывает скорость кровотока, сужения и тромбы.', 'УЗДГ сосудов шеи, вен и артерий конечностей', 'Подготовка не требуется.', 13),
('uzi-sustavov', 'УЗИ суставов и мягких тканей', 'Связки, мышцы, суставные сумки', 'uzi', 'Bone', 'от 1100 сом', NULL, 'Исследование помогает выявить воспаление, разрывы связок и скопление жидкости.', 'УЗИ коленных, плечевых, тазобедренных суставов', 'Подготовка не требуется.', 14),
('obshchiy-analiz-krovi', 'Общий анализ крови', 'Базовое исследование с расшифровкой', 'lab', 'TestTube', 'от 350 сом', 'Результат за 1 день', 'Общий анализ крови показывает воспаление, анемию и состояние иммунитета.', '24 показателя, лейкоцитарная формула', 'Сдаётся натощак утром.', 15),
('biohimiya-krovi', 'Биохимия крови', 'Печень, почки, обмен веществ', 'lab', 'FlaskConical', 'от 900 сом', NULL, 'Биохимический профиль оценивает работу внутренних органов и обмен веществ.', 'Глюкоза, АЛТ, АСТ, креатинин, липидный профиль', 'Сдаётся натощак, 8–12 часов без еды.', 16),
('gormony', 'Гормональные исследования', 'Щитовидная железа, репродуктивные гормоны', 'lab', 'Dna', 'от 600 сом', NULL, 'Гормональные панели для эндокринологии, гинекологии и урологии.', 'ТТГ, Т4, пролактин, тестостерон, кортизол', 'Сдаётся утром натощак.', 17),
('analizy-mochi', 'Анализы мочи', 'Общий анализ, проба Нечипоренко', 'lab', 'Droplets', 'от 300 сом', NULL, 'Исследования мочи выявляют воспаление и нарушения работы почек.', 'Общий анализ мочи, проба Нечипоренко, суточная моча', 'Соберите утреннюю порцию в стерильный контейнер.', 18),
('infekcii-pcr', 'ПЦР и инфекции', 'Точное выявление возбудителя', 'lab', 'Microscope', 'от 800 сом', NULL, 'ПЦР-диагностика определяет вирусы и бактерии с высокой точностью.', 'ПЦР-панели, ИППП, гепатиты, ВИЧ', 'Уточните подготовку у администратора.', 19),
('onkomarkery', 'Онкомаркеры', 'Раннее выявление и контроль лечения', 'lab', 'Ribbon', 'от 900 сом', NULL, 'Онкомаркеры используют для скрининга и наблюдения за динамикой лечения.', 'ПСА, СА-125, СА-15-3, АФП, СЕА', 'Сдаётся натощак.', 20),
('ekg', 'ЭКГ', 'Электрокардиограмма с расшифровкой врача', 'funkc', 'Activity', 'от 500 сом', NULL, 'ЭКГ фиксирует ритм и проводимость сердца, расшифровку делает кардиолог.', 'ЭКГ в 12 отведениях, ЭКГ с нагрузкой', 'Подготовка не требуется.', 21),
('holter', 'Холтеровское мониторирование', 'Суточный контроль сердца и давления', 'funkc', 'Gauge', 'от 2500 сом', NULL, 'Суточная запись ЭКГ и давления помогает выявить скрытые нарушения ритма.', 'Холтер ЭКГ 24 часа, СМАД', 'Ведите привычный образ жизни во время исследования.', 22),
('spirometriya', 'Спирометрия', 'Исследование функции дыхания', 'funkc', 'Wind', 'от 800 сом', NULL, 'Спирометрия оценивает объём и скорость дыхания, важна при астме и ХОБЛ.', 'Спирометрия, проба с бронхолитиком', 'Не курить и не заниматься спортом за 2 часа.', 23),
('fgds', 'ФГДС (гастроскопия)', 'Осмотр желудка и двенадцатиперстной кишки', 'endo', 'Stethoscope', 'от 2200 сом', 'Комфортно', 'Гастроскопия на современном эндоскопе, при необходимости — с седацией.', 'ФГДС, биопсия, тест на Helicobacter pylori', 'Натощак, 8 часов без еды и воды.', 24),
('kolonoskopiya', 'Колоноскопия', 'Осмотр толстой кишки', 'endo', 'Microscope', 'от 4500 сом', NULL, 'Колоноскопия выявляет полипы и воспалительные изменения кишечника.', 'Колоноскопия, полипэктомия, биопсия', 'Специальная подготовка препаратом за день до исследования.', 25);