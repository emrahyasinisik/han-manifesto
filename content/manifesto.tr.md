---
brand: HAN
subline: Hub for Agent Networks
title: Ticaret verisi ajanlar için ortak bir dil konuşmalı.
intro: HAN, pazaryeri verisini ortak bir şemaya indirgeyip üstünde güvenilir zekâ kurmanın ilkelerini ortaya koyar. Satış vaadi değil; nasıl inşa edeceğimizin taahhüdü.
---

## UCP nedir, ne değildir

**UCP ortak şemadır.** Katalog, sipariş ve kimlik bağlama için ajanların ve sistemlerin konuşabileceği canonical biçimler sunar.

**UCP analiz motoru değildir.** SEO skoru, öneri metni veya kâr-zarar hesabı protokolün işi değildir; bunlar bizim katmanımızda yaşar.

Bu ayrım bozulursa mimari çürür: her pazaryeri için yeniden “zeka” yazmaya başlarız.

## Tek çatı ilkesi

Her pazaryeri bir **connector** ile gelir: ham veriyi çeker, yorumlamaz.

Connector çıktısı **UCP normalizasyon** ile tek dile çevrilir.

Analiz bir kez yazılır. Yeni bir pazaryeri eklemek, üst katmanları yeniden yazmak demek değildir.

## Zekâ üst katmanda

Skor, SEO sinyalleri ve öneriler normalize verinin üzerinde çalışır.

**Kural önce gelir** — ölçüm tekrarlanabilir ve denetlenebilir kalır.

**LLM ikincildir** — yalnızca bulanık işlerde (yeniden yazım, anahtar kelime çıkarımı) devreye girer; skoru gizlice değiştirmez.

Metrik, skor ve karar/öneri birbirine karıştırılmaz.

## Agent-ready katalog

Ürün feed’i yalnızca vitrin için değildir; Google, ChatGPT, Perplexity ve benzeri ajanlar için de okunabilir olmalıdır.

Eksik alan, şişirilmiş başlık, tekrarlayan içerik ve zayıf nitelikler ajan keşfini ve güveni düşürür.

Uyum, “güzel görünmek” değil; **ajanların doğru anlaması**dır.

## İnsan onayı

Öneri üretmek yetmez. Platforma geri yazmadan önce insan onayı gerekir.

Onay, güven içindir; aynı zamanda modelin öğreneceği geri bildirimdir.

Tam otomatik düzeltme, hesap riskini ve hatalı yayını kullanıcıya yükler — bunu reddederiz.

## Güvenli otomasyon

Onaylanan değişiklikler tek patlamada değil, **parça parça** ve rate-limit’e saygılı uygulanır.

İsteklere jitter eklenir; kuyruk bir üründe düşse bile durmaz; her deneme audit log’a yazılır.

Güncelleme öncesi eski veri saklanır — **rollback** bir lüks değil, güvenlik ağıdır.
