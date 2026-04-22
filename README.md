# Sayfa HTML Kaydedici

Aktif sekmedeki web sayfasinin tam HTML kaynagini tek tikla `.html` dosyasi olarak indiren, Manifest V3 tabanli basit bir Chrome eklentisi.

## Kurulum (Yuklenmemis / Geliştirici Modu)

1. `chrome://extensions` sayfasini ac.
2. Sag ustten **Gelistirici modu**nu (Developer mode) etkinlestir.
3. **Paketlenmemis ogeyi yukle** (Load unpacked) butonuna tikla.
4. Bu depo klasorunu (`manifest.json`'un bulundugu klasor) sec.

## Kullanim

- Kaydetmek istedigin sayfaya git.
- Tarayici arac cubugundaki eklenti ikonuna tikla.
- Varsayilan indirmeler klasorune `<alanadi>_<YYYY-MM-DD_HH-mm-ss>.html` adinda bir dosya olusur.
- Basari durumunda ikonda kisa sureli yesil **OK**, hata durumunda kirmizi **ERR** rozetibelirir.

## Kisitlamalar

- `chrome://`, `edge://`, Chrome Web Store gibi sistem sayfalarinda komut dosyasi enjekte edilemez; bu sayfalarda eklenti **ERR** gosterir.
- Indirilen HTML, DOM'un tiklama anindaki durumunu yansitir (dinamik olarak olusturulmus icerik dahil).

## Dosya Yapisi

```
.
manifest.json   # Manifest V3 tanimi
background.js   # Service worker (tiklamayi yakalar, HTML'i indirir)
icons/          # 16/48/128 px eklenti ikonlari
README.md
```

## Izinler

- `activeTab` — tiklama anindaki aktif sekmeye erisim
- `scripting` — aktif sekmeye HTML'i alip indirme baglantisi olusturan fonksiyonu enjekte etmek icin

## Sorun Giderme

Eklenti ikonunda **ERR** rozeti goruyorsan:

1. Bulundugun sayfa `http://`, `https://` veya `file://` olmali. `chrome://`, `edge://`, Chrome Web Store ve benzeri dahili sayfalarda eklenti calismaz.
2. `chrome://extensions` -> bu eklenti -> **Hizmetli Calisani'ni incele** (service worker -> "Inspect") baglantisini ac. Acilan DevTools konsolunda gercek hata mesaji gorunur.
3. Sayfa icerik guvenlik politikasi (CSP) veya tarayici ayari download'lari engelliyorsa indirme basarisiz olabilir; ayni sayfayi farkli bir siteyle test et.
