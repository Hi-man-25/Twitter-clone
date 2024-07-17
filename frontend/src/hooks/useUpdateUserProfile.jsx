import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();
    const {mutateAsync:updateProfile , isPending:isUpdatingUserProfile} = useMutation({
		mutationFn : async (formData) => {
			try {
				const res = await fetch(`/api/users/update` , {
					method:'POST',
					headers : {
						"Content-Type" : "application/json",
					},
					body : JSON.stringify(formData),
				});
				const data = res.json();
				if(!res.ok) throw new Error(data.error || "Something went Wrong");				
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
		onSuccess : () => {
			toast.success("profile update sucessfully");
			Promise.all([
				queryClient.invalidateQueries({queryKey : ["authUser"]}),
				queryClient.invalidateQueries({queryKey : ["userProfile"]}),
			])
		},
		onError : (error) => {
			toast.error(error.message);
		}
	});
    return {updateProfile , isUpdatingUserProfile};
}

export default useUpdateUserProfile;