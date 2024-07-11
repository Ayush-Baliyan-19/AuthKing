FROM node:latest

COPY . /home/authking

WORKDIR /home/authking

RUN npm install

EXPOSE 5000

# Add environment variables
ENV PORT=80
ENV DATABASE="mongodb+srv://AyushBaliyan:ballu123@authking.dyshkzy.mongodb.net/?retryWrites=true&w=majority"
ENV NODEMAILER_USER="ayushbaliyan05@gmail.com"
ENV NODEMAILER_PASS="mstadpvvispgfrru"
ENV SecretKey="AyushIsAGoodBoy"
ENV JWT_SECRET="<div>helloWorldThisisMyFirstWebsite</div>"

CMD ["node", "app.js"]