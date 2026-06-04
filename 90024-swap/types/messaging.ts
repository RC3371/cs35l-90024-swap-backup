export type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  participants: string[];
  title: string;
  last_message_content: string;
  last_message_at: string;
  created_at: string;
};
