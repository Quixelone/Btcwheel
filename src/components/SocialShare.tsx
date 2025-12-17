import { Twitter, Linkedin, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface SocialShareProps {
  title: string;
  description: string;
  url?: string;
  hashtags?: string[];
  className?: string;
}

export function SocialShare({ 
  title, 
  description, 
  url = 'https://btcwheel.io', 
  hashtags = ['btcwheel', 'bitcoin', 'trading'],
  className = ''
}: SocialShareProps) {
  
  const handleShare = (platform: 'twitter' | 'linkedin' | 'copy') => {
    const text = `${title}\n\n${description}`;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags.join(',')}`, '_blank');
        break;
      case 'linkedin':
        // LinkedIn sharing is limited via URL, usually just URL
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(`${text}\n\n${url}`);
        toast.success('Link copiato negli appunti!');
        break;
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => handleShare('twitter')}
        title="Condividi su X (Twitter)"
        className="text-black hover:text-black hover:bg-gray-100 border-gray-200"
      >
        <Twitter className="w-4 h-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => handleShare('linkedin')}
        title="Condividi su LinkedIn"
        className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
      >
        <Linkedin className="w-4 h-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => handleShare('copy')}
        title="Copia Link"
        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200"
      >
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  );
}
