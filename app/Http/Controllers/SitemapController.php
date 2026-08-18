<?php

namespace App\Http\Controllers;

use App\Models\News;
use Carbon\Carbon;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate dynamic XML sitemap for public SEO crawlers.
     */
    public function index(): Response
    {
        $baseUrl = config('app.url', url('/'));

        $staticPages = [
            ['loc' => $baseUrl, 'priority' => '1.0', 'changefreq' => 'daily', 'lastmod' => Carbon::now()->toIso8601String()],
            ['loc' => $baseUrl.'/profil', 'priority' => '0.8', 'changefreq' => 'monthly', 'lastmod' => Carbon::now()->subDays(3)->toIso8601String()],
            ['loc' => $baseUrl.'/guru', 'priority' => '0.8', 'changefreq' => 'weekly', 'lastmod' => Carbon::now()->subDays(2)->toIso8601String()],
            ['loc' => $baseUrl.'/berita', 'priority' => '0.9', 'changefreq' => 'daily', 'lastmod' => Carbon::now()->toIso8601String()],
            ['loc' => $baseUrl.'/kalender', 'priority' => '0.7', 'changefreq' => 'weekly', 'lastmod' => Carbon::now()->toIso8601String()],
            ['loc' => $baseUrl.'/pendaftaran', 'priority' => '0.9', 'changefreq' => 'daily', 'lastmod' => Carbon::now()->toIso8601String()],
            ['loc' => $baseUrl.'/kontak', 'priority' => '0.6', 'changefreq' => 'monthly', 'lastmod' => Carbon::now()->subMonth()->toIso8601String()],
            ['loc' => $baseUrl.'/faq', 'priority' => '0.5', 'changefreq' => 'monthly', 'lastmod' => Carbon::now()->subMonth()->toIso8601String()],
        ];

        // Published news articles
        $newsList = News::where('status', 'published')
            ->orderBy('published_at', 'desc')
            ->limit(100)
            ->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

        foreach ($staticPages as $page) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$page['loc']}</loc>\n";
            $xml .= "    <lastmod>{$page['lastmod']}</lastmod>\n";
            $xml .= "    <changefreq>{$page['changefreq']}</changefreq>\n";
            $xml .= "    <priority>{$page['priority']}</priority>\n";
            $xml .= "  </url>\n";
        }

        foreach ($newsList as $news) {
            $newsUrl = $baseUrl.'/berita/'.$news->slug;
            $lastmod = ($news->updated_at ?? $news->published_at ?? Carbon::now())->toIso8601String();
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$newsUrl}</loc>\n";
            $xml .= "    <lastmod>{$lastmod}</lastmod>\n";
            $xml .= "    <changefreq>weekly</changefreq>\n";
            $xml .= "    <priority>0.7</priority>\n";
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }
}
