import { User, Conversation } from './types';

// Mock data cho người dùng
export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Vũ Huy Hoàng",
    email: "hoang@gmail.com",
    avatar: "/avatars/01.png",
    status: "online",
    role: "Admin"
  },
  {
    id: "u2",
    name: "Nguyễn Thị Hồng",
    email: "hong@gmail.com",
    avatar: "/avatars/02.png",
    status: "online",
    role: "Teacher"
  },
  {
    id: "u3",
    name: "Trần Văn Nam",
    email: "nam@gmail.com",
    avatar: "/avatars/03.png",
    status: "away",
    role: "Teacher"
  },
  {
    id: "u4",
    name: "Lê Thị Hoa",
    email: "hoa@gmail.com",
    avatar: "/avatars/04.png",
    status: "offline",
    role: "Parent"
  },
  {
    id: "u5",
    name: "Phạm Minh Tuấn",
    email: "tuan@gmail.com",
    avatar: "/avatars/05.png",
    status: "online",
    role: "Student"
  },
  {
    id: "u6",
    name: "Vũ Thị Mai",
    email: "mai@gmail.com",
    avatar: "/avatars/06.png",
    status: "offline",
    role: "Parent"
  }
];

// Mock data cho cuộc trò chuyện
export const mockConversations: Conversation[] = [
  {
    id: "c1",
    participants: [mockUsers[0], mockUsers[1]],
    messages: [
      {
        id: "m1",
        senderId: "u2",
        content: "Chào thầy, em muốn hỏi về lịch học tuần sau",
        timestamp: new Date(2023, 6, 10, 10, 30),
        attachments: []
      },
      {
        id: "m2",
        senderId: "u1",
        content: "Chào cô, lịch học tuần sau sẽ được cập nhật vào Chủ nhật này nhé",
        timestamp: new Date(2023, 6, 10, 10, 35),
        attachments: []
      },
      {
        id: "m3",
        senderId: "u2",
        content: "Vâng, em cảm ơn thầy",
        timestamp: new Date(2023, 6, 10, 10, 40),
        attachments: []
      }
    ]
  },
  {
    id: "c2",
    participants: [mockUsers[0], mockUsers[2]],
    messages: [
      {
        id: "m1",
        senderId: "u3",
        content: "Chào thầy, em có gửi tài liệu lớp học của tuần này",
        timestamp: new Date(2023, 6, 11, 14, 20),
        attachments: []
      },
      {
        id: "m2",
        senderId: "u1",
        content: "Cảm ơn thầy, tôi sẽ xem qua và phản hồi sớm",
        timestamp: new Date(2023, 6, 11, 14, 25),
        attachments: []
      },
      {
        id: "m3",
        senderId: "u3",
        content: "Đây là kế hoạch bài giảng đã cập nhật",
        timestamp: new Date(2023, 6, 11, 14, 30),
        attachments: [
          {
            id: "a1",
            name: "KeHoachBaiGiang.pdf",
            size: 1024 * 1024 * 2.5,
            type: "application/pdf",
            url: "/files/sample.pdf"
          }
        ]
      }
    ]
  },
  {
    id: "c3",
    participants: [mockUsers[0], mockUsers[3]],
    messages: [
      {
        id: "m1",
        senderId: "u4",
        content: "Xin chào, tôi muốn hỏi về kết quả học tập của con",
        timestamp: new Date(2023, 6, 12, 9, 10),
        attachments: []
      },
      {
        id: "m2",
        senderId: "u1",
        content: "Chào anh/chị, kết quả học tập của học sinh sẽ được cập nhật vào cuối tháng",
        timestamp: new Date(2023, 6, 12, 9, 15),
        attachments: []
      },
      {
        id: "m3",
        senderId: "u4",
        content: "Cảm ơn thầy/cô đã thông báo",
        timestamp: new Date(2023, 6, 12, 9, 20),
        attachments: []
      }
    ]
  },
  {
    id: "c4",
    participants: [mockUsers[0], mockUsers[4]],
    messages: [
      {
        id: "m1",
        senderId: "u5",
        content: "Thầy ơi, em không hiểu bài tập đã được giao",
        timestamp: new Date(2023, 6, 13, 16, 40),
        attachments: []
      },
      {
        id: "m2",
        senderId: "u1",
        content: "Em có thể cho thầy biết phần nào em chưa hiểu không?",
        timestamp: new Date(2023, 6, 13, 16, 45),
        attachments: []
      },
      {
        id: "m3",
        senderId: "u5",
        content: "Dạ, phần bài tập số 3 ạ",
        timestamp: new Date(2023, 6, 13, 16, 50),
        attachments: []
      },
      {
        id: "m4",
        senderId: "u1",
        content: "Thầy sẽ giải thích lại trong buổi học tới nhé",
        timestamp: new Date(2023, 6, 13, 16, 55),
        attachments: []
      }
    ]
  },
  {
    id: "c5",
    participants: [mockUsers[0], mockUsers[5]],
    messages: [
      {
        id: "m1",
        senderId: "u6",
        content: "Chào thầy/cô, tôi muốn đăng ký lịch gặp để trao đổi về tiến độ học tập của con",
        timestamp: new Date(2023, 6, 14, 11, 5),
        attachments: []
      },
      {
        id: "m2",
        senderId: "u1",
        content: "Chào anh/chị, chúng tôi có lịch gặp phụ huynh vào thứ 5 tuần sau",
        timestamp: new Date(2023, 6, 14, 11, 10),
        attachments: []
      },
      {
        id: "m3",
        senderId: "u6",
        content: "Vâng, tôi sẽ sắp xếp thời gian. Cảm ơn thầy/cô",
        timestamp: new Date(2023, 6, 14, 11, 15),
        attachments: []
      }
    ]
  }
]; 