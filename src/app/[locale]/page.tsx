
"use client";
import React from "react";
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export default function IndexPage({ params }: { params: Promise<{ locale: "en" | "es" }> }) {
    const { locale } = React.use(params);

    const t = useTranslations('Header');
    const pathname = usePathname();
    const router = useRouter();

    const otherLocale = (routing.locales.find((l) => l !== locale) as "en" | "es") || routing.defaultLocale;

    const handleSwitchLanguage = () => {
        router.replace(otherLocale);
    };

    return (
        <div className="flex min-h-screen flex-col">
            <main>
                <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                {/* Language Switcher */}
                                <button
                                    className="absolute top-4 right-4 px-3 py-1 bg-muted text-primary rounded border border-primary transition hover:bg-primary hover:text-white"
                                    onClick={handleSwitchLanguage}
                                    aria-label={`Switch to ${otherLocale === 'en' ? 'English' : 'Español'}`}
                                >
                                    {otherLocale === 'en' ? 'English' : 'Español'}
                                </button>
                                {/* Test translation: h1 */}
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                    {t('worlds')}
                                </h1>
                                {/* Test translation: p */}
                                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                                    {t('docs')}
                                </p>
                                {/* Test translation: button */}
                                <button
                                    className="mt-4 px-4 py-2 bg-primary text-white rounded"
                                    onClick={() => alert('Import button clicked!')}
                                >
                                    {t('import')}
                                </button>
                                {/* Original content */}
                                <h2 className="text-2xl font-semibold mt-8">{t('newWorld')}</h2>
                                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                                    Create, manage, and explore your fictional universes with interactive maps, characters, locations,
                                    organizations, and timelines.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
