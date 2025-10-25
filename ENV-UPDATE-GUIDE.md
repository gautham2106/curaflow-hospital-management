# 🔧 **ENVIRONMENT FILE UPDATE GUIDE**

## **📋 WHATSAPP CREDENTIALS CORRECTION**

### **❌ Current (Wrong) Values:**
```bash
WHATSAPP_ACCESS_TOKEN=EAAAN6tcBzAUBOZC82CW7iR2LiaZBwUHS4Y7FDtQxRUPy1PHZClDGZBZCgWdrTisgMjpFKiZAi1FBBQNO2IqZBAzdZAA16lmUs0XgRcCf6z1LLxQCgLXDEpg80d41UZBt1FKJZCqJFcTYXJvSMeHLvOdZwFyZBrV9ZPHZASSqxDZBUZASyFdzjiy2A1sippEsF4DVV5W2IlkOSr2LrMLuYoNMYBy8xQczzOKDOMccqHEZD
WHATSAPP_PHONE_NUMBER_ID=108119992383348
```

### **✅ Correct Values:**
```bash
WHATSAPP_ACCESS_TOKEN=EAAQzPY217joBPghgZAIW1IQ1u7OlHDH419Y6LQDbJj9aJ1xwgY1zwWCdV1l35yRrYTqy76UwZCZCIsLQzejlv5ro5hEiyNrtSZBx8VyBfJTimZBN7jXjA4ZCBpWbZBLRD35MZCGEPinPoMPGrch7A4B1iqKoaj7TZCIUs80x4Xy4P2b8Cp6eHUjZCbylkTkBpiSHTYNAZDZD
WHATSAPP_PHONE_ID=591459790706231
```

---

## **🔧 HOW TO FIX**

### **Step 1: Open Your .env File**
1. **Navigate to your project root** (where .env file is located)
2. **Open .env file** in any text editor (Notepad, VS Code, etc.)

### **Step 2: Update WhatsApp Credentials**
Replace these lines in your .env file:

**Find this line:**
```bash
WHATSAPP_ACCESS_TOKEN=EAAAN6tcBzAUBOZC82CW7iR2LiaZBwUHS4Y7FDtQxRUPy1PHZClDGZBZCgWdrTisgMjpFKiZAi1FBBQNO2IqZBAzdZAA16lmUs0XgRcCf6z1LLxQCgLXDEpg80d41UZBt1FKJZCqJFcTYXJvSMeHLvOdZwFyZBrV9ZPHZASSqxDZBUZASyFdzjiy2A1sippEsF4DVV5W2IlkOSr2LrMLuYoNMYBy8xQczzOKDOMccqHEZD
```

**Replace with:**
```bash
WHATSAPP_ACCESS_TOKEN=EAAQzPY217joBPghgZAIW1IQ1u7OlHDH419Y6LQDbJj9aJ1xwgY1zwWCdV1l35yRrYTqy76UwZCZCIsLQzejlv5ro5hEiyNrtSZBx8VyBfJTimZBN7jXjA4ZCBpWbZBLRD35MZCGEPinPoMPGrch7A4B1iqKoaj7TZCIUs80x4Xy4P2b8Cp6eHUjZCbylkTkBpiSHTYNAZDZD
```

**Find this line:**
```bash
WHATSAPP_PHONE_NUMBER_ID=108119992383348
```

**Replace with:**
```bash
WHATSAPP_PHONE_ID=591459790706231
```

### **Step 3: Save the File**
1. **Save the .env file** with the updated values
2. **Restart your development server** (`npm run dev`)

---

## **📋 COMPLETE CORRECTED .env FILE**

Here's what your complete .env file should look like:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://fgmljvcczanglzattxrs.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbWxqdmNjemFuZ2x6YXR0eHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMzU4ODIsImV4cCI6MjA3NjcxMTg4Mn0.UoPEDrm64mBjfQI3CzsPrjVtpHJxoVb8K1hSbyp6Tsg"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbWxqdmNjemFuZ2x6YXR0eHJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTEzNTg4MiwiZXhwIjoyMDc2NzExODgyfQ.VjNwP2UknvSdVUkivPJYLP3S5X0qw7YcnFjH95DEjv8"

# AI Configuration
GEMINI_API_KEY=

# WhatsApp Configuration
WHATSAPP_ACCESS_TOKEN=EAAQzPY217joBPghgZAIW1IQ1u7OlHDH419Y6LQDbJj9aJ1xwgY1zwWCdV1l35yRrYTqy76UwZCZCIsLQzejlv5ro5hEiyNrtSZBx8VyBfJTimZBN7jXjA4ZCBpWbZBLRD35MZCGEPinPoMPGrch7A4B1iqKoaj7TZCIUs80x4Xy4P2b8Cp6eHUjZCbylkTkBpiSHTYNAZDZD
WHATSAPP_PHONE_ID=591459790706231
```

---

## **🧪 TEST WHATSAPP INTEGRATION**

After updating your .env file, test the WhatsApp integration:

1. **Start your development server** (`npm run dev`)
2. **Go to your app** and generate a token
3. **Try to send a WhatsApp notification**
4. **Check if it works** with the correct credentials

---

## **✅ EXPECTED RESULT**

After updating the WhatsApp credentials:
- ✅ **WhatsApp notifications will work** correctly
- ✅ **No more authentication errors** from WhatsApp API
- ✅ **Token generation with WhatsApp** will succeed
- ✅ **Patients will receive** proper WhatsApp messages

---

## **🔧 QUICK FIX COMMANDS**

If you want to update via command line:

```bash
# Backup current .env
copy .env .env.backup

# Update WhatsApp credentials
powershell -Command "(Get-Content .env) -replace 'EAAAN6tcBzAUBOZC82CW7iR2LiaZBwUHS4Y7FDtQxRUPy1PHZClDGZBZCgWdrTisgMjpFKiZAi1FBBQNO2IqZBAzdZAA16lmUs0XgRcCf6z1LLxQCgLXDEpg80d41UZBt1FKJZCqJFcTYXJvSMeHLvOdZwFyZBrV9ZPHZASSqxDZBUZASyFdzjiy2A1sippEsF4DVV5W2IlkOSr2LrMLuYoNMYBy8xQczzOKDOMccqHEZD', 'EAAQzPY217joBPghgZAIW1IQ1u7OlHDH419Y6LQDbJj9aJ1xwgY1zwWCdV1l35yRrYTqy76UwZCZCIsLQzejlv5ro5hEiyNrtSZBx8VyBfJTimZBN7jXjA4ZCBpWbZBLRD35MZCGEPinPoMPGrch7A4B1iqKoaj7TZCIUs80x4Xy4P2b8Cp6eHUjZCbylkTkBpiSHTYNAZDZD' | Set-Content .env"

powershell -Command "(Get-Content .env) -replace 'WHATSAPP_PHONE_NUMBER_ID=108119992383348', 'WHATSAPP_PHONE_ID=591459790706231' | Set-Content .env"
```

---

## **🎉 AFTER FIXING**

Your WhatsApp integration will work perfectly with the correct credentials!

**Update your .env file now and restart your server!** 🚀
