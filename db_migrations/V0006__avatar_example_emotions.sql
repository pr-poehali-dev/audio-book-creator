UPDATE t_p29363705_audio_book_creator.creative_projects
SET data = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        data,
        '{avatarUrl}', '"https://cdn.poehali.dev/projects/84e163f9-9661-409a-9ae9-a67ebf795811/files/219e05d1-1bb5-4cd1-ad33-57a90ee15a03.jpg"'::jsonb
      ),
      '{avatarVariants}', '[
        "https://cdn.poehali.dev/projects/84e163f9-9661-409a-9ae9-a67ebf795811/files/4d456f1c-d7d9-456f-acbf-5211de14d766.jpg",
        "https://cdn.poehali.dev/projects/84e163f9-9661-409a-9ae9-a67ebf795811/files/219e05d1-1bb5-4cd1-ad33-57a90ee15a03.jpg",
        "https://cdn.poehali.dev/projects/84e163f9-9661-409a-9ae9-a67ebf795811/files/1c1a2989-7fbf-46a3-b357-61b0f1538884.jpg",
        "https://cdn.poehali.dev/projects/84e163f9-9661-409a-9ae9-a67ebf795811/files/00f88544-a4cc-4f4e-ab53-2719796e49ac.jpg"
      ]'::jsonb
    ),
    '{expressions}', '{
      "neutral": "https://cdn.poehali.dev/projects/84e163f9-9661-409a-9ae9-a67ebf795811/files/4d456f1c-d7d9-456f-acbf-5211de14d766.jpg",
      "smile": "https://cdn.poehali.dev/projects/84e163f9-9661-409a-9ae9-a67ebf795811/files/219e05d1-1bb5-4cd1-ad33-57a90ee15a03.jpg",
      "happy": "https://cdn.poehali.dev/projects/84e163f9-9661-409a-9ae9-a67ebf795811/files/1c1a2989-7fbf-46a3-b357-61b0f1538884.jpg",
      "caring": "https://cdn.poehali.dev/projects/84e163f9-9661-409a-9ae9-a67ebf795811/files/00f88544-a4cc-4f4e-ab53-2719796e49ac.jpg"
    }'::jsonb
  ),
  '{chat}', '[
    {"from": "avatar", "text": "Здравствуйте! Меня зовут Марина, я помогу подобрать квартиру в ЖК «Солнечный квартал». Расскажите, для кого ищете жильё — и я предложу лучшие варианты под ваш бюджет.", "emotion": "smile"},
    {"from": "client", "text": "Здравствуйте. Смотрим двушку для семьи, но переживаю, что не потянем ипотеку."},
    {"from": "avatar", "text": "Понимаю ваше беспокойство, это нормально. Давайте посчитаем вместе и спокойно: с семейной ипотекой от 5% платёж за двухкомнатную сопоставим с арендой. Я подберу программу именно под ваш доход.", "emotion": "caring"},
    {"from": "client", "text": "А какие сейчас есть акции?"},
    {"from": "avatar", "text": "Отличный вопрос! Сейчас действует прекрасная акция: при покупке двух- или трёхкомнатной квартиры мы дарим кухню, плюс рассрочка 0% до сдачи дома. Это серьёзная выгода для семьи!", "emotion": "happy"},
    {"from": "client", "text": "Звучит интересно. А где именно расположен дом?"},
    {"from": "avatar", "text": "Всего 12 минут до центра, рядом метро. При этом под окнами свой парк, школа и детский сад — детей никуда возить не нужно. Хотите, я запишу вас на просмотр квартиры на этой неделе?", "emotion": "smile"}
  ]'::jsonb
)
WHERE id = '94703590-b882-45ab-8f65-c79b66a73921';
