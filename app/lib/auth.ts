import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserRole } from "@/app/types/user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  createdAt: Date;
  organization?: string;
  department?: string;
  position?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  address?: string;
  region?: string; // Kullanıcının bölge bilgisi
}

console.log('🚀 Auth konfigürasyonu yükleniyor...');

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔐 Authorize fonksiyonu çağrıldı!');
        console.log('📧 Gelen credentials:', credentials);
        
        // Burada gerçek bir API ile kimlik doğrulama yapılacak
        // Şimdilik demo kullanıcılar tanımlayalım
        
        const users = [
          {
            id: "1",
            name: "Admin Kullanıcı",
            email: "admin@ornek.com",
            role: UserRole.ADMIN,
            regions: ["all"],
            password: "admin1234"
          },
          {
            id: "2",
            name: "Bölge Yöneticisi",
            email: "byonetici@ornek.com",
            role: UserRole.REGIONAL_MANAGER,
            regions: ["istanbul", "ankara"],
            password: "byonetici1234"
          },
          {
            id: "3",
            name: "Kurum Yöneticisi",
            email: "kyonetici@ornek.com",
            role: UserRole.MANAGER,
            regions: ["istanbul"],
            password: "kyonetici1234"
          },
          {
            id: "4",
            name: "Personel Kullanıcı",
            email: "personel@ornek.com",
            role: UserRole.STAFF,
            regions: ["istanbul"],
            password: "personel1234"
          },
          {
            id: "5",
            name: "Gönüllü Kullanıcı",
            email: "gonullu@ornek.com",
            role: UserRole.VOLUNTEER,
            regions: ["istanbul"],
            password: "gonullu1234"
          },
          {
            id: "6",
            name: "Vatandaş Kullanıcı",
            email: "vatandas@ornek.com",
            role: UserRole.CITIZEN,
            password: "vatandas1234"
          }
        ];

        const user = users.find(user => 
          user.email === credentials?.email && 
          user.password === credentials?.password
        );

        console.log('👤 Bulunan kullanıcı:', user ? 'Başarılı' : 'Bulunamadı');
        console.log('📧 Aranan email:', credentials?.email);
        console.log('🔑 Aranan şifre:', credentials?.password);

        if (user) {
          // Şifreyi istemciye göndermeyin
          const { password, ...userWithoutPassword } = user;
          console.log('✅ Kullanıcı doğrulandı:', userWithoutPassword);
          return userWithoutPassword;
        }
        
        console.log('❌ Kullanıcı doğrulanamadı');
        return null;
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.regions = user.regions;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.regions = token.regions as string[] | undefined;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  secret: process.env.NEXTAUTH_SECRET || "emergency-management-secret-key-2025",
};

// Demo kullanıcıları
const demoUsers = [
  {
    id: '1',
    name: 'Admin Kullanıcı',
    email: 'admin@ornek.com',
    password: 'admin1234',
    role: UserRole.ADMIN,
    organization: 'AFAD',
    department: 'Yönetim',
    position: 'Sistem Yöneticisi',
    phoneNumber: '555-123-4567',
    region: 'Türkiye'
  },
  {
    id: '2',
    name: 'Bölge Yöneticisi',
    email: 'byonetici@ornek.com',
    password: 'byonetici1234',
    role: UserRole.REGIONAL_MANAGER,
    organization: 'AFAD',
    department: 'Bölge Yönetimi',
    position: 'Bölge Müdürü',
    phoneNumber: '555-234-5678',
    region: 'Marmara Bölgesi'
  },
  {
    id: '3',
    name: 'Kurum Yöneticisi',
    email: 'kyonetici@ornek.com',
    password: 'kyonetici1234',
    role: UserRole.MANAGER,
    organization: 'İstanbul AFAD',
    department: 'Kriz Yönetimi',
    position: 'Kriz Yöneticisi',
    phoneNumber: '555-345-6789',
    region: 'İstanbul'
  },
  {
    id: '4',
    name: 'Personel',
    email: 'personel@ornek.com',
    password: 'personel1234',
    role: UserRole.STAFF,
    organization: 'İstanbul AFAD',
    department: 'Saha Operasyonu',
    position: 'Saha Koordinatörü',
    phoneNumber: '555-456-7890',
    region: 'İstanbul'
  },
  {
    id: '5',
    name: 'Gönüllü',
    email: 'gonullu@ornek.com',
    password: 'gonullu1234',
    role: UserRole.VOLUNTEER,
    organization: 'AHBAP',
    region: 'Ankara'
  },
  {
    id: '6',
    name: 'Vatandaş',
    email: 'vatandas@ornek.com',
    password: 'vatandas1234',
    role: UserRole.CITIZEN,
    region: 'İzmir'
  }
]; 