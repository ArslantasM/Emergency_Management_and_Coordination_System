"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Card, Form, Input, Typography, Spin, App } from "antd";

const { Title, Text } = Typography;

function LoginForm() {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        message.error("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
        return;
      }

      message.success("Giriş başarılı. Yönlendiriliyorsunuz...");
      router.push("/dashboard");
    } catch (error) {
      console.error("Giriş hatası:", error);
      message.error("Giriş sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large">
          <div className="p-5">Yükleniyor...</div>
        </Spin>
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-6">
          <Title level={2}>Acil Durum Yönetim Sistemi</Title>
          <Text>Hesabınıza giriş yapın</Text>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            label="E-posta"
            name="email"
            rules={[
              {
                required: true,
                message: "Lütfen e-posta adresinizi girin!",
              },
              {
                type: "email",
                message: "Geçerli bir e-posta adresi girin!",
              },
            ]}
          >
            <Input placeholder="E-posta adresiniz" />
          </Form.Item>

          <Form.Item
            label="Şifre"
            name="password"
            rules={[
              {
                required: true,
                message: "Lütfen şifrenizi girin!",
              },
            ]}
          >
            <Input.Password placeholder="Şifreniz" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="bg-blue-600"
            >
              Giriş Yap
            </Button>
          </Form.Item>

          <div className="text-center mt-4">
            <Text>
              Demo Kullanıcılar:
            </Text>
            <div className="grid grid-cols-1 gap-2 mt-2 text-xs">
              <div>
                <Text strong>Admin:</Text> admin@ornek.com / admin1234
              </div>
              <div>
                <Text strong>Bölge Yöneticisi:</Text> byonetici@ornek.com / byonetici1234
              </div>
              <div>
                <Text strong>Kurum Yöneticisi:</Text> kyonetici@ornek.com / kyonetici1234
              </div>
              <div>
                <Text strong>Personel:</Text> personel@ornek.com / personel1234
              </div>
              <div>
                <Text strong>Gönüllü:</Text> gonullu@ornek.com / gonullu1234
              </div>
              <div>
                <Text strong>Vatandaş:</Text> vatandas@ornek.com / vatandas1234
              </div>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <App>
      <LoginForm />
    </App>
  );
} 