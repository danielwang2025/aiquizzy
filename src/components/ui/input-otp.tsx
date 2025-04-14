import React, { useState } from 'react';

interface InputOtpProps {
  onSubmit?: (otp: string) => void;
}

const InputOtp: React.FC<InputOtpProps> = ({ onSubmit }) => {
  const [otp, setOtp] = useState(''); // 用于存储用户输入的验证码

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(event.target.value); // 更新状态
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(otp); // 提交验证码
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h3>请输入验证码</h3>
      <input
        type="text"
        value={otp}
        onChange={handleChange}
        placeholder="请输入验证码"
        style={{
          padding: '10px',
          fontSize: '16px',
          textAlign: 'center',
          width: '200px',
          marginBottom: '10px',
        }}
      />
      <div>
        <button
          onClick={handleSubmit}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          提交
        </button>
      </div>
      <div>
        <p>您输入的验证码是：<strong>{otp}</strong></p> {/* 实时显示输入的验证码 */}
      </div>
    </div>
  );
};

export default InputOtp;
