CREATE TABLE public.checkup_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  title text NOT NULL,
  subtitle text,
  body text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.checkup_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  badge text,
  image_url text,
  price text,
  body text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.checkup_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checkup_sections TO authenticated;
GRANT ALL ON public.checkup_sections TO service_role;
GRANT SELECT ON public.checkup_cards TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checkup_cards TO authenticated;
GRANT ALL ON public.checkup_cards TO service_role;

ALTER TABLE public.checkup_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkup_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active checkup sections" ON public.checkup_sections FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can view all checkup sections" ON public.checkup_sections FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert checkup sections" ON public.checkup_sections FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update checkup sections" ON public.checkup_sections FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete checkup sections" ON public.checkup_sections FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active checkup cards" ON public.checkup_cards FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can view all checkup cards" ON public.checkup_cards FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert checkup cards" ON public.checkup_cards FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update checkup cards" ON public.checkup_cards FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete checkup cards" ON public.checkup_cards FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER checkup_sections_set_updated_at BEFORE UPDATE ON public.checkup_sections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER checkup_cards_set_updated_at BEFORE UPDATE ON public.checkup_cards FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.checkup_sections (key, title, subtitle, sort_order) VALUES
  ('hero', 'Hero', 'Чекапы — комплексные программы для ранней диагностики и контроля здоровья.', 1),
  ('about', 'О чекапе', 'Что такое чекап и зачем он нужен.', 2),
  ('flagship', 'Флагманские чекапы', 'Главные программы клиники — баннер с карточками.', 3),
  ('all-programs', 'Все программы', 'Полный список программ чекапов.', 4),
  ('for-whom', 'Для кого', 'Кому подходит чекап.', 5),
  ('detects', 'Что выявляет', 'Какие риски и заболевания выявляет чекап.', 6),
  ('how-to-choose', 'Как выбрать чекап', 'Подбор программы по возрасту и целям.', 7),
  ('extra-packages', 'Дополнительные пакеты', 'Расширенные обследования к базовой программе.', 8),
  ('kids', 'Детские чекапы', 'Программы для детей и подростков.', 9),
  ('mini', 'Мини-чекапы', 'Быстрые программы за одно посещение.', 10),
  ('how-it-goes', 'Как проходит', 'Этапы прохождения чекапа.', 11),
  ('health-passport', 'Паспорт здоровья', 'Итоговое заключение и план действий.', 12),
  ('where', 'Где пройти', 'Филиалы, где доступны чекапы.', 13),
  ('faq', 'FAQ', 'Частые вопросы о чекапах.', 14),
  ('cta', 'CTA', 'Блок записи на чекап.', 15);

INSERT INTO public.checkup_cards (slug, title, subtitle, badge, price, body, sort_order) VALUES
  ('muzhskoy-chekap', 'Мужской чекап', 'Комплексная диагностика для мужчин от 18 до 50 лет. Оценка основных показателей здоровья, выявление рисков.', 'От 18–50 лет', '19 900 сом', 'Программа включает анализы крови и мочи, ЭКГ, УЗИ органов брюшной полости и консультацию терапевта. Результаты — в день обращения.', 1),
  ('zhenskiy-chekap', 'Женский чекап', 'Комплексная диагностика для женщин от 18 до 50 лет. Здоровье, гормональный фон, репродуктивная система.', 'От 18–50 лет', '21 900 сом', 'Программа включает лабораторные анализы, УЗИ, консультацию гинеколога и терапевта.', 2),
  ('chekap-diabet-cgm', 'Чекап диабет — мониторинг с CGM', 'Постоянный мониторинг уровня глюкозы с помощью датчика CGM. Анализ тенденций и рекомендации.', '14 дней мониторинга', '24 900 сом', 'Датчик CGM на 14 дней, отчёт по динамике глюкозы и консультация эндокринолога.', 3),
  ('chekap-diabet', 'Чекап диабет — диагностика', 'Диагностика сахарного диабета и предиабета. Оценка углеводного обмена и рисков осложнений.', '40+ показателей', '17 900 сом', 'Лабораторная диагностика углеводного обмена, оценка рисков осложнений, консультация эндокринолога.', 4),
  ('detskiy-chekap', 'Детский чекап', 'Программа для детей и подростков: развитие, иммунитет, базовые показатели здоровья.', 'Для детей', '14 900 сом', 'Осмотр педиатра, лабораторные анализы и рекомендации по здоровью ребёнка.', 5);