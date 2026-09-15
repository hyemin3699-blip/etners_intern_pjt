create table if not exists registered_faqs (
    id bigint generated always as identity primary key,
    category text not null,
    topic text not null,
    question text not null,
    answer text not null,
    created_at timestamptz not null default now()
);
