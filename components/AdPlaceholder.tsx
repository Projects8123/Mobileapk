import React from 'react';
import { useTranslation } from 'react-i18next';

interface AdPlaceholderProps {
  type: 'banner' | 'mpu' | 'custom';
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

const AdPlaceholder: React.FC<AdPlaceholderProps> = ({
  type,
  width,
  height,
  className = '',
  style = {},
}) => {
  const { t } = useTranslation();
  let adWidth: string | number = width || '100%';
  let adHeight: string | number = height || '50px';
  let label = t('adPlaceholder.default');

  if (type === 'banner') {
    adWidth = width || '320px'; 
    adHeight = height || '50px';
    label = t('adPlaceholder.banner', { width: adWidth.toString(), height: adHeight.toString() });
  } else if (type === 'mpu') {
    adWidth = width || '300px';
    adHeight = height || '250px';
    label = t('adPlaceholder.mpu', { width: adWidth.toString(), height: adHeight.toString() });
  } else if (type === 'custom' && width && height) {
    label = t('adPlaceholder.custom', { width: width.toString(), height: height.toString() });
  }


  return (
    <div
      style={{
        width: typeof adWidth === 'number' ? `${adWidth}px` : adWidth,
        height: typeof adHeight === 'number' ? `${adHeight}px` : adHeight,
        maxWidth: '100%',
        ...style,
      }}
      className={`bg-gray-200/70 border border-dashed border-gray-400 flex items-center justify-center text-gray-500 text-xs p-2 ${className}`}
      role="region"
      aria-label={label}
    >
      <span className="text-center">{label}</span>
    </div>
  );
};

export default AdPlaceholder;