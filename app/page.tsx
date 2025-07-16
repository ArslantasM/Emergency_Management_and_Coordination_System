import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/auth/login");
  }

  // Bu kısım hiç çalışmayacak çünkü yukarıdaki koşullar her zaman bir yönlendirme yapacak
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Acil Durum Yönetim ve Koordinasyon Sistemi
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Afet ve acil durum yönetiminde koordinasyonu sağlamak için geliştirilmiş kapsamlı bir platform
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link 
            href="/auth/login" 
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors"
          >
            Giriş Yap
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Gerçek Zamanlı Harita</h2>
            <p className="text-gray-600">
              Özelleştirilmiş harita özellikleri ile durum değerlendirmesi ve koordinasyon
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Ekip Yönetimi</h2>
            <p className="text-gray-600">
              Sahada çalışan ekiplerin konum takibi ve görev yönetimi
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Bölge Koordinasyonu</h2>
            <p className="text-gray-600">
              Hiyerarşik bölge tanımları ile kapsamlı yönetim ve raporlama
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
