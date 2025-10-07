import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const reasons = [
  {
    title: "Pengalaman dan Keahlian",
    description: "Tim kami memiliki pengalaman bertahun-tahun dalam industri jasa, memastikan kualitas layanan yang tinggi."
  },
  {
    title: "Layanan Terpersonalisasi",
    description: "Kami menyesuaikan layanan sesuai kebutuhan spesifik Anda untuk hasil yang optimal."
  },
  {
    title: "Teknologi Modern",
    description: "Menggunakan teknologi terkini untuk efisiensi dan inovasi dalam setiap layanan yang kami berikan."
  },
  {
    title: "Harga Kompetitif",
    description: "Menawarkan harga yang bersaing tanpa mengorbankan kualitas, memberikan nilai terbaik untuk investasi Anda."
  },
  {
    title: "Dukungan Pelanggan 24/7",
    description: "Tim dukungan kami tersedia kapan saja untuk membantu Anda dengan pertanyaan atau masalah apa pun."
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Selamat Datang di Hadona Jasa</h1>
          <p className="text-xl text-muted-foreground">Solusi jasa terpercaya untuk kebutuhan Anda</p>
        </div>
      </div>

      {/* Why Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Mengapa Memilih Hadona Jasa?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">{reason.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{reason.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
